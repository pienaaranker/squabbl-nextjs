# Migration from Firestore to Firebase Realtime Database

## Overview
This document outlines the steps needed to transition our application from Firestore to Firebase Realtime Database. The migration aims to maintain current functionality while leveraging RTDB's strengths for real-time gaming scenarios.

## Current Architecture

### Data Model
- `games` collection with game documents
- Subcollections per game:
  - `teams` - Team data with scores
  - `players` - Player information
  - `words` - Words submitted by players

### Key Operations
- Real-time listeners with `onSnapshot`
- Queries with filters (e.g., `where("code", "==", code)`)
- Collection and document operations

## Migration Steps

### 1. Data Structure Redesign

#### RTDB Structure (Proposed)
```json
{
  "games": {
    "gameId1": {
      "code": "ABC2",
      "state": "lobby",
      "currentRound": null,
      "activeTeamId": null,
      "activePlayerId": null,
      "turnOrder": [],
      "createdAt": 1627984621543,
      "turnStartTime": null,
      "teams": {
        "teamId1": {
          "name": "Team 1",
          "score": 0
        }
      },
      "players": {
        "playerId1": {
          "name": "Player 1",
          "teamId": "teamId1",
          "isHost": true,
          "joinedAt": 1627984621543
        }
      },
      "words": {
        "wordId1": {
          "text": "example",
          "submittedByPlayerId": "playerId1",
          "guessedInRound1": false,
          "guessedInRound2": false,
          "guessedInRound3": false
        }
      }
    }
  },
  "game_codes": {
    "ABC2": "gameId1"
  }
}
```

### 2. Environment Setup

1. **Update Firebase Config**
   - Ensure `databaseURL` is set in `.env` and Firebase config
   - Confirm RTDB is enabled in Firebase console

2. **Update Dependencies**
   - Already importing `getDatabase` from `firebase/database`
   - Update `firebase.json` to include RTDB rules

### 3. Create RTDB Rules

Create `database.rules.json`:
```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        "teams": {
          "$teamId": {
            ".read": true,
            ".write": true
          }
        },
        "players": {
          "$playerId": {
            ".read": true,
            ".write": true
          }
        },
        "words": {
          "$wordId": {
            ".read": true,
            ".write": "root.child('games').child($gameId).child('state').val() == 'lobby' || 
                       data.exists()"
          }
        }
      }
    },
    "game_codes": {
      ".read": true,
      ".write": true,
      ".indexOn": [".value"]
    }
  }
}
```

### 4. Update Firebase Configuration

Update `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "database": {
    "rules": "database.rules.json"
  }
}
```

### 5. Service Layer Migration

Create a new service file `src/lib/firebase/rtdbGameService.ts`:

1. **Basic CRUD Operations**
   - Replace Firestore operations with RTDB equivalents
   - Update timestamp handling (RTDB uses milliseconds)

2. **Real-time Listeners**
   - Replace `onSnapshot` with `onValue`
   - Update query patterns for RTDB

3. **Migration Helper Methods**
   - Functions to facilitate data transfer between databases

### 6. Modify Data Access Methods

Update all Firebase operations in these key files:
1. `src/lib/firebase/gameService.ts`
2. Game page components
3. All components using `onSnapshot`

### 7. Code Updates by Function Type

#### Reads
```javascript
// Firestore (old)
const gameRef = doc(db, "games", gameId);
const unsubGame = onSnapshot(gameRef, (docSnap) => {
  const gameData = { id: docSnap.id, ...docSnap.data() };
  // process data
});

// RTDB (new)
const gameRef = ref(rtdb, `games/${gameId}`);
const unsubGame = onValue(gameRef, (snapshot) => {
  const gameData = { id: gameId, ...snapshot.val() };
  // process data
});
```

#### Writes
```javascript
// Firestore (old)
const docRef = await addDoc(collection(db, "games"), newGameData);
const gameId = docRef.id;

// RTDB (new)
const gameId = push(child(ref(rtdb), 'games')).key;
await set(ref(rtdb, `games/${gameId}`), newGameData);
await set(ref(rtdb, `game_codes/${code}`), gameId);
```

#### Queries
```javascript
// Firestore (old)
const q = query(collection(db, "games"), where("code", "==", code));
const querySnapshot = await getDocs(q);

// RTDB (new)
const gameId = await get(ref(rtdb, `game_codes/${code}`));
const gameData = await get(ref(rtdb, `games/${gameId.val()}`));
```

### 8. Testing Plan

1. **Parallel Testing Environment**
   - Create a separate test environment with RTDB
   - Run tests against both databases to verify functionality

2. **Test Key Scenarios**
   - Game creation and joining
   - Team management
   - Word submission
   - Game state progression
   - Real-time updates during gameplay

3. **Performance Comparison**
   - Latency measurements
   - Data synchronization verification
   - Concurrency handling

### 9. Migration Execution

1. **Data Export/Import**
   - Export Firestore data
   - Transform to RTDB format
   - Import to RTDB

2. **Feature Flag Implementation**
   - Add a feature flag to toggle between databases
   - Gradually roll out RTDB to production

3. **Rollback Plan**
   - Maintain Firestore access during transition
   - Document procedures for emergency rollback

### 10. Post-Migration

1. **Monitoring**
   - Set up monitoring for key performance metrics
   - Watch for errors or unexpected behavior

2. **Optimization**
   - Review and optimize RTDB indexing
   - Adjust data structure for better performance

3. **Documentation Updates**
   - Update all technical documentation
   - Train team on RTDB best practices

## Timeframe
- Preparation: 1 week
- Development: 2-3 weeks
- Testing: 1 week
- Migration: 1-2 days
- Verification: 1 week

## Potential Challenges

1. **Data Modeling Differences**
   - Firestore's collection-document model vs. RTDB's JSON tree
   - Flattening of nested documents
   - Designing efficient queries without Firestore's advanced filtering

2. **Indexing**
   - Adapting to RTDB's `.indexOn` rules
   - Managing performance for different query patterns

3. **Security Rules**
   - Converting Firestore's fine-grained security rules to RTDB format
   - Maintaining proper access controls

4. **Data Size Limitations**
   - RTDB has different scaling characteristics
   - May need to implement data archiving strategy

## Recommendations

1. Take advantage of RTDB's strengths:
   - Lower latency for real-time updates
   - Offline capabilities
   - Simpler scaling for high-frequency updates

2. Update game code search to use the `game_codes` index

3. Consider implementing data denormalization strategies for common queries

4. Implement proper database cleanup routines to manage RTDB size 