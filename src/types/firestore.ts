/**
 * Represents the main document for a game session in the 'games' collection.
 */
export interface Game {
  id: string; // Document ID
  code: string; // 4-character alphanumeric game code
  state: 'lobby' | 'round1' | 'round2' | 'round3' | 'finished';
  currentRound: 1 | 2 | 3 | null;
  activeTeamId: string | null; // ID of the team whose turn it is
  activePlayerId: string | null; // ID of the player whose turn it is within the active team
  turnOrder: string[]; // Array of team IDs in the order they take turns
  createdAt: Date; // Or Firebase Timestamp
  // Potentially add hostId if needed for specific controls
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
  teamId: string | null; // ID of the team the player belongs to
  isHost?: boolean; // Optional: Flag if this player created the game
  joinedAt: Date; // Or Firebase Timestamp
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
