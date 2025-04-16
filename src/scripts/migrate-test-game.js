// Test script for migrating a game from Firestore to RTDB
import { db, rtdb } from '../lib/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, set, push } from 'firebase/database';

/**
 * Migrates a single game from Firestore to RTDB for testing
 */
async function migrateTestGame(gameId) {
  try {
    console.log(`Starting migration for game ${gameId}...`);
    
    // 1. Get the game data from Firestore
    const gameDoc = await getDoc(doc(db, "games", gameId));
    if (!gameDoc.exists()) {
      throw new Error(`Game ${gameId} not found in Firestore`);
    }
    
    // Extract game data
    const gameData = gameDoc.data();
    console.log(`Found game: ${gameData.code}`);
    
    // 2. Create the game in RTDB
    const rtdbGameData = {
      ...gameData,
      // Convert Firestore timestamp to RTDB milliseconds
      createdAt: gameData.createdAt?.toMillis() || Date.now(),
      // Convert other timestamps if needed
      turnStartTime: gameData.turnStartTime?.toMillis() || null
    };
    
    // 3. Set the game data in RTDB
    await set(ref(rtdb, `games/${gameId}`), rtdbGameData);
    console.log(`Game data migrated to RTDB`);
    
    // 4. Create the game code index entry
    await set(ref(rtdb, `game_codes/${gameData.code}`), gameId);
    console.log(`Game code index created`);
    
    // 5. Get and migrate teams
    const teamsSnapshot = await getDocs(collection(db, "games", gameId, "teams"));
    console.log(`Found ${teamsSnapshot.size} teams`);
    
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data();
      const teamId = teamDoc.id;
      await set(ref(rtdb, `games/${gameId}/teams/${teamId}`), teamData);
      console.log(`Migrated team: ${teamData.name}`);
    }
    
    // 6. Get and migrate players
    const playersSnapshot = await getDocs(collection(db, "games", gameId, "players"));
    console.log(`Found ${playersSnapshot.size} players`);
    
    for (const playerDoc of playersSnapshot.docs) {
      const playerData = playerDoc.data();
      const playerId = playerDoc.id;
      
      // Convert any timestamps
      const rtdbPlayerData = {
        ...playerData,
        joinedAt: playerData.joinedAt?.toMillis() || Date.now()
      };
      
      await set(ref(rtdb, `games/${gameId}/players/${playerId}`), rtdbPlayerData);
      console.log(`Migrated player: ${playerData.name}`);
    }
    
    // 7. Get and migrate words
    const wordsSnapshot = await getDocs(collection(db, "games", gameId, "words"));
    console.log(`Found ${wordsSnapshot.size} words`);
    
    for (const wordDoc of wordsSnapshot.docs) {
      const wordData = wordDoc.data();
      const wordId = wordDoc.id;
      await set(ref(rtdb, `games/${gameId}/words/${wordId}`), wordData);
      console.log(`Migrated word: ${wordData.text}`);
    }
    
    console.log(`Migration of game ${gameId} completed successfully!`);
    return true;
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}

// Check for command line argument
const gameIdToMigrate = process.argv[2];

if (!gameIdToMigrate) {
  console.error("Please provide a game ID to migrate");
  process.exit(1);
}

// Run the migration
migrateTestGame(gameIdToMigrate)
  .then(() => {
    console.log("Migration completed successfully!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Migration failed:", error);
    process.exit(1);
  }); 