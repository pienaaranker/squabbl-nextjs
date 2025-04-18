/**
 * Represents the main document for a game session in the 'games' collection.
 */
export interface Game {
  id: string; // Document ID
  code: string; // 4-character alphanumeric game code
  hostId: string;
  state: 'lobby' | 'playing' | 'completed';
  currentRound?: 1 | 2 | 3;
  activeTeamId?: string;
  turnState?: 'paused' | 'active';
  turnStartTime?: any; // Firestore Timestamp
  lastGuessedWord?: {
    text: string;
    teamId: string;
    timestamp: number;
  };
  generatedWords: {
    [wordId: string]: {
      word: string;
      category?: string;
      generatedAt: any; // Firestore Timestamp
    }
  };
  createdAt: any; // Firestore Timestamp
}

/**
 * Represents a team document in the 'teams' subcollection of a game.
 */
export interface Team {
  id: string; // Document ID
  name: string;
  score: number;
}

/**
 * Represents a player document in the 'players' subcollection of a game.
 */
export interface Player {
  id: string; // Document ID (could be Firebase Auth UID if using auth)
  name: string;
  teamId?: string;
  isHost: boolean;
  assignedCategory?: string;
  joinedAt: any; // Firestore Timestamp
}

/**
 * Represents a word document in the 'words' subcollection of a game.
 */
export interface Word {
  id: string; // Document ID
  text: string;
  submittedByPlayerId: string; // ID of the player who submitted the word
  // Track guessed status per round
  guessedInRound1?: boolean;
  guessedInRound2?: boolean;
  guessedInRound3?: boolean;
}

// Example of how the structure might look in Firestore:
// /games/{gameId} (Game document)
//   /teams/{teamId} (Team document)
//   /players/{playerId} (Player document)
//   /words/{wordId} (Word document)
