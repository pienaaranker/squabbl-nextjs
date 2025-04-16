import { ref, set, push, onValue, get, update, child, remove, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from './config';
import { generateGameCode } from '../utils/gameCode';
import type { Game, Team, Player, Word } from '@/types/firestore'; // Reusing types for now

/**
 * Creates a new game session in the Realtime Database.
 * @returns {Promise<{id: string, code: string}>} The ID and code of the newly created game.
 * @throws {Error} If there's an issue creating the game.
 */
export async function createNewGameRTDB(): Promise<{id: string, code: string}> {
  try {
    const gamesRef = ref(rtdb, 'games');
    let code: string;
    let codeExists: boolean;
    
    // Generate a unique code
    do {
      code = generateGameCode();
      const codeSnapshot = await get(ref(rtdb, `game_codes/${code}`));
      codeExists = codeSnapshot.exists();
    } while (codeExists);
    
    // Generate a new game ID
    const newGameRef = push(gamesRef);
    const gameId = newGameRef.key!;
    
    // Prepare the initial game data
    const newGameData = {
      code,
      state: 'lobby',
      currentRound: null,
      activeTeamId: null,
      activePlayerId: null,
      turnOrder: [],
      createdAt: Date.now(),
      turnStartTime: null,
    };
    
    // Set game data
    await set(ref(rtdb, `games/${gameId}`), newGameData);
    
    // Set game code index for quick lookup
    await set(ref(rtdb, `game_codes/${code}`), gameId);
    
    console.log("New game created with ID: ", gameId, "and code:", code);
    return { id: gameId, code };
  } catch (error) {
    console.error("Error creating new game:", error);
    throw new Error("Failed to create game session.");
  }
}

/**
 * Finds a game by its code in the Realtime Database.
 * @param {string} code - The game code to search for.
 * @returns {Promise<Game | null>} The game data if found, null otherwise.
 */
export async function findGameByCodeRTDB(code: string): Promise<Game | null> {
  try {
    // Get the game ID from the code index
    const gameIdSnapshot = await get(ref(rtdb, `game_codes/${code.toUpperCase()}`));
    
    if (!gameIdSnapshot.exists()) {
      return null;
    }
    
    const gameId = gameIdSnapshot.val();
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    
    if (!gameSnapshot.exists()) {
      return null;
    }
    
    // Convert to Game type with ID
    const gameData = gameSnapshot.val();
    return { 
      id: gameId,
      ...gameData,
      // Convert timestamp if needed
      createdAt: new Date(gameData.createdAt)
    } as Game;
  } catch (error) {
    console.error("Error finding game by code:", error);
    throw new Error("Failed to find game.");
  }
}

/**
 * Sets up a real-time listener for a game.
 * @param {string} gameId - The ID of the game to listen to.
 * @param {function} callback - The callback to call when the game changes.
 * @returns {function} A function to unsubscribe from the listener.
 */
export function onGameChange(gameId: string, callback: (game: Game | null) => void): () => void {
  const gameRef = ref(rtdb, `games/${gameId}`);
  
  const unsubscribe = onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      const gameData = snapshot.val();
      callback({
        id: gameId,
        ...gameData,
        // Convert timestamp if needed
        createdAt: new Date(gameData.createdAt),
        turnStartTime: gameData.turnStartTime
      } as Game);
    } else {
      callback(null);
    }
  });
  
  return unsubscribe;
}

/**
 * Sets up a real-time listener for teams in a game.
 * @param {string} gameId - The ID of the game.
 * @param {function} callback - The callback to call when teams change.
 * @returns {function} A function to unsubscribe from the listener.
 */
export function onTeamsChange(gameId: string, callback: (teams: Team[]) => void): () => void {
  const teamsRef = ref(rtdb, `games/${gameId}/teams`);
  
  const unsubscribe = onValue(teamsRef, (snapshot) => {
    if (snapshot.exists()) {
      const teamsData = snapshot.val();
      const teams: Team[] = Object.entries(teamsData).map(([id, data]) => ({
        id,
        ...data as Omit<Team, 'id'>
      }));
      callback(teams);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
}

/**
 * Sets up a real-time listener for players in a game.
 * @param {string} gameId - The ID of the game.
 * @param {function} callback - The callback to call when players change.
 * @returns {function} A function to unsubscribe from the listener.
 */
export function onPlayersChange(gameId: string, callback: (players: Player[]) => void): () => void {
  const playersRef = ref(rtdb, `games/${gameId}/players`);
  
  const unsubscribe = onValue(playersRef, (snapshot) => {
    if (snapshot.exists()) {
      const playersData = snapshot.val();
      const players: Player[] = Object.entries(playersData).map(([id, data]) => {
        const playerData = data as any;
        return {
          id,
          ...playerData,
          // Convert joinedAt timestamp if needed
          joinedAt: new Date(playerData.joinedAt)
        };
      });
      callback(players);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
}

/**
 * Adds a new team to a game.
 * @param {string} gameId - The ID of the game.
 * @param {Omit<Team, 'id' | 'score'>} teamData - The data for the new team.
 * @returns {Promise<string>} The ID of the newly created team.
 */
export async function addTeamToGameRTDB(gameId: string, teamData: Omit<Team, 'id' | 'score'>): Promise<string> {
  try {
    const teamRef = push(ref(rtdb, `games/${gameId}/teams`));
    const teamId = teamRef.key!;
    
    const newTeamData = {
      ...teamData,
      score: 0 // Initialize score to 0
    };
    
    await set(teamRef, newTeamData);
    console.log(`Team '${teamData.name}' added to game ${gameId} with ID: ${teamId}`);
    return teamId;
  } catch (error) {
    console.error(`Error adding team to game ${gameId}:`, error);
    throw new Error("Failed to add team.");
  }
}

/**
 * Updates a team's data.
 * @param {string} gameId - The ID of the game.
 * @param {string} teamId - The ID of the team to update.
 * @param {Partial<Omit<Team, 'id'>>} teamData - The team data to update.
 * @returns {Promise<void>}
 */
export async function updateTeamRTDB(
  gameId: string, 
  teamId: string, 
  teamData: Partial<Omit<Team, 'id'>>
): Promise<void> {
  try {
    await update(ref(rtdb, `games/${gameId}/teams/${teamId}`), teamData);
    console.log(`Team ${teamId} updated in game ${gameId}`);
  } catch (error) {
    console.error(`Error updating team ${teamId} in game ${gameId}:`, error);
    throw new Error("Failed to update team.");
  }
}

/**
 * Gets all teams for a game.
 * @param {string} gameId - The ID of the game.
 * @returns {Promise<Team[]>} Array of team objects.
 */
export async function getAllTeamsRTDB(gameId: string): Promise<Team[]> {
  try {
    const teamsSnapshot = await get(ref(rtdb, `games/${gameId}/teams`));
    
    if (!teamsSnapshot.exists()) {
      return [];
    }
    
    const teamsData = teamsSnapshot.val();
    return Object.entries(teamsData).map(([id, data]) => ({
      id,
      ...data as Omit<Team, 'id'>
    }));
  } catch (error) {
    console.error(`Error getting all teams for game ${gameId}:`, error);
    throw new Error("Failed to get teams.");
  }
}

/**
 * Gets a single team by ID.
 * @param {string} gameId - The ID of the game.
 * @param {string} teamId - The ID of the team to get.
 * @returns {Promise<Team | null>} The team object if found, null otherwise.
 */
export async function getTeamByIdRTDB(gameId: string, teamId: string): Promise<Team | null> {
  try {
    const teamSnapshot = await get(ref(rtdb, `games/${gameId}/teams/${teamId}`));
    
    if (!teamSnapshot.exists()) {
      return null;
    }
    
    return {
      id: teamId,
      ...teamSnapshot.val()
    };
  } catch (error) {
    console.error(`Error getting team ${teamId} in game ${gameId}:`, error);
    throw new Error("Failed to get team.");
  }
}

/**
 * Deletes a team from a game.
 * @param {string} gameId - The ID of the game.
 * @param {string} teamId - The ID of the team to delete.
 * @returns {Promise<void>}
 */
export async function deleteTeamRTDB(gameId: string, teamId: string): Promise<void> {
  try {
    // Check if any players are assigned to this team
    const playersSnapshot = await get(ref(rtdb, `games/${gameId}/players`));
    
    if (playersSnapshot.exists()) {
      const playersData = playersSnapshot.val();
      const hasPlayers = Object.values(playersData).some((player: any) => player.teamId === teamId);
      
      if (hasPlayers) {
        throw new Error("Cannot delete team with assigned players. Remove players first.");
      }
    }
    
    // Delete the team
    await remove(ref(rtdb, `games/${gameId}/teams/${teamId}`));
    console.log(`Team ${teamId} deleted from game ${gameId}`);
    
    // Update game if this team was the active team
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (gameSnapshot.exists()) {
      const gameData = gameSnapshot.val();
      if (gameData.activeTeamId === teamId) {
        await update(ref(rtdb, `games/${gameId}`), { activeTeamId: null });
      }
      
      // Remove team from turn order if present
      if (gameData.turnOrder && gameData.turnOrder.includes(teamId)) {
        const updatedTurnOrder = gameData.turnOrder.filter((id: string) => id !== teamId);
        await update(ref(rtdb, `games/${gameId}`), { turnOrder: updatedTurnOrder });
      }
    }
  } catch (error) {
    console.error(`Error deleting team ${teamId} from game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Updates a team's score.
 * @param {string} gameId - The ID of the game.
 * @param {string} teamId - The ID of the team.
 * @param {number} score - The new score.
 * @returns {Promise<void>}
 */
export async function updateTeamScoreRTDB(gameId: string, teamId: string, score: number): Promise<void> {
  try {
    await update(ref(rtdb, `games/${gameId}/teams/${teamId}`), { score });
    console.log(`Score updated for team ${teamId} in game ${gameId}`);
  } catch (error) {
    console.error(`Error updating score for team ${teamId} in game ${gameId}:`, error);
    throw new Error("Failed to update team score.");
  }
}

/**
 * Adds a new player to a game.
 * @param {string} gameId - The ID of the game.
 * @param {Omit<Player, 'id' | 'joinedAt'>} playerData - The data for the new player.
 * @returns {Promise<string>} The ID of the newly created player.
 */
export async function addPlayerToGameRTDB(
  gameId: string, 
  playerData: Omit<Player, 'id' | 'joinedAt'>
): Promise<string> {
  try {
    const playerRef = push(ref(rtdb, `games/${gameId}/players`));
    const playerId = playerRef.key!;
    
    const newPlayerData = {
      ...playerData,
      joinedAt: Date.now()
    };
    
    await set(playerRef, newPlayerData);
    console.log(`Player '${playerData.name}' added to game ${gameId} with ID: ${playerId}`);
    return playerId;
  } catch (error) {
    console.error(`Error adding player to game ${gameId}:`, error);
    throw new Error("Failed to add player.");
  }
}

/**
 * Updates a player's data.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player to update.
 * @param {Partial<Omit<Player, 'id' | 'joinedAt'>>} playerData - The player data to update.
 * @returns {Promise<void>}
 */
export async function updatePlayerRTDB(
  gameId: string, 
  playerId: string, 
  playerData: Partial<Omit<Player, 'id' | 'joinedAt'>>
): Promise<void> {
  try {
    await update(ref(rtdb, `games/${gameId}/players/${playerId}`), playerData);
    console.log(`Player ${playerId} updated in game ${gameId}`);
  } catch (error) {
    console.error(`Error updating player ${playerId} in game ${gameId}:`, error);
    throw new Error("Failed to update player.");
  }
}

/**
 * Gets all players for a game.
 * @param {string} gameId - The ID of the game.
 * @returns {Promise<Player[]>} Array of player objects.
 */
export async function getAllPlayersRTDB(gameId: string): Promise<Player[]> {
  try {
    const playersSnapshot = await get(ref(rtdb, `games/${gameId}/players`));
    
    if (!playersSnapshot.exists()) {
      return [];
    }
    
    const playersData = playersSnapshot.val();
    return Object.entries(playersData).map(([id, data]) => {
      const playerData = data as any;
      return {
        id,
        ...playerData,
        joinedAt: new Date(playerData.joinedAt)
      };
    });
  } catch (error) {
    console.error(`Error getting all players for game ${gameId}:`, error);
    throw new Error("Failed to get players.");
  }
}

/**
 * Gets a player by ID.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player to get.
 * @returns {Promise<Player | null>} The player object if found, null otherwise.
 */
export async function getPlayerByIdRTDB(gameId: string, playerId: string): Promise<Player | null> {
  try {
    const playerSnapshot = await get(ref(rtdb, `games/${gameId}/players/${playerId}`));
    
    if (!playerSnapshot.exists()) {
      return null;
    }
    
    const playerData = playerSnapshot.val();
    return {
      id: playerId,
      ...playerData,
      joinedAt: new Date(playerData.joinedAt)
    };
  } catch (error) {
    console.error(`Error getting player ${playerId} in game ${gameId}:`, error);
    throw new Error("Failed to get player.");
  }
}

/**
 * Gets all players assigned to a specific team.
 * @param {string} gameId - The ID of the game.
 * @param {string} teamId - The ID of the team.
 * @returns {Promise<Player[]>} Array of player objects.
 */
export async function getPlayersForTeamRTDB(gameId: string, teamId: string): Promise<Player[]> {
  try {
    const playersSnapshot = await get(ref(rtdb, `games/${gameId}/players`));
    
    if (!playersSnapshot.exists()) {
      return [];
    }
    
    const playersData = playersSnapshot.val();
    return Object.entries(playersData)
      .filter(([_, data]) => (data as any).teamId === teamId)
      .map(([id, data]) => {
        const playerData = data as any;
        return {
          id,
          ...playerData,
          joinedAt: new Date(playerData.joinedAt)
        };
      });
  } catch (error) {
    console.error(`Error getting players for team ${teamId} in game ${gameId}:`, error);
    throw new Error("Failed to retrieve team players.");
  }
}

/**
 * Assigns a player to a team.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player.
 * @param {string} teamId - The ID of the team.
 * @returns {Promise<void>}
 */
export async function assignPlayerToTeamRTDB(
  gameId: string,
  playerId: string,
  teamId: string
): Promise<void> {
  try {
    // Verify the team exists
    const teamSnapshot = await get(ref(rtdb, `games/${gameId}/teams/${teamId}`));
    if (!teamSnapshot.exists()) {
      throw new Error(`Team ${teamId} does not exist in game ${gameId}`);
    }
    
    // Update the player's team ID
    await update(ref(rtdb, `games/${gameId}/players/${playerId}`), { teamId });
    console.log(`Player ${playerId} assigned to team ${teamId} in game ${gameId}`);
  } catch (error) {
    console.error(`Error assigning player ${playerId} to team ${teamId} in game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Removes a player from a game.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player to remove.
 * @returns {Promise<void>}
 */
export async function removePlayerFromGameRTDB(gameId: string, playerId: string): Promise<void> {
  try {
    // Check if this player is the active player
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (gameSnapshot.exists()) {
      const gameData = gameSnapshot.val();
      if (gameData.activePlayerId === playerId) {
        await update(ref(rtdb, `games/${gameId}`), { activePlayerId: null });
      }
    }
    
    // Remove the player
    await remove(ref(rtdb, `games/${gameId}/players/${playerId}`));
    console.log(`Player ${playerId} removed from game ${gameId}`);
  } catch (error) {
    console.error(`Error removing player ${playerId} from game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Adds a word to a game.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player submitting the word.
 * @param {string} text - The word text.
 * @returns {Promise<string>} The ID of the newly created word.
 */
export async function addWordToGameRTDB(
  gameId: string,
  playerId: string,
  text: string
): Promise<string> {
  try {
    // Check if the game is in 'lobby' state
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (gameSnapshot.exists()) {
      const gameData = gameSnapshot.val();
      if (gameData.state !== 'lobby') {
        throw new Error("Words can only be added when the game is in the lobby state.");
      }
    } else {
      throw new Error(`Game ${gameId} not found.`);
    }
    
    // Add the word
    const wordRef = push(ref(rtdb, `games/${gameId}/words`));
    const wordId = wordRef.key!;
    
    const wordData = {
      text: text.trim(),
      submittedByPlayerId: playerId,
      guessedInRound1: false,
      guessedInRound2: false,
      guessedInRound3: false
    };
    
    await set(wordRef, wordData);
    console.log(`Word '${text}' added to game ${gameId} by player ${playerId}`);
    return wordId;
  } catch (error) {
    console.error(`Error adding word to game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Gets all words for a game.
 * @param {string} gameId - The ID of the game.
 * @returns {Promise<Word[]>} Array of word objects.
 */
export async function getAllWordsRTDB(gameId: string): Promise<Word[]> {
  try {
    const wordsSnapshot = await get(ref(rtdb, `games/${gameId}/words`));
    
    if (!wordsSnapshot.exists()) {
      return [];
    }
    
    const wordsData = wordsSnapshot.val();
    return Object.entries(wordsData).map(([id, data]) => ({
      id,
      ...data as Omit<Word, 'id'>
    }));
  } catch (error) {
    console.error(`Error getting all words for game ${gameId}:`, error);
    throw new Error("Failed to get words.");
  }
}

/**
 * Gets all words submitted by a specific player.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player.
 * @returns {Promise<Word[]>} Array of word objects.
 */
export async function getPlayerWordsRTDB(gameId: string, playerId: string): Promise<Word[]> {
  try {
    const wordsSnapshot = await get(ref(rtdb, `games/${gameId}/words`));
    
    if (!wordsSnapshot.exists()) {
      return [];
    }
    
    const wordsData = wordsSnapshot.val();
    return Object.entries(wordsData)
      .filter(([_, data]) => (data as any).submittedByPlayerId === playerId)
      .map(([id, data]) => ({
        id,
        ...data as Omit<Word, 'id'>
      }));
  } catch (error) {
    console.error(`Error getting player words for game ${gameId}:`, error);
    throw new Error("Failed to get player words.");
  }
}

/**
 * Updates the state of a word.
 * @param {string} gameId - The ID of the game.
 * @param {string} wordId - The ID of the word to update.
 * @param {Partial<Omit<Word, 'id' | 'text' | 'submittedByPlayerId'>>} wordData - The word data to update.
 * @returns {Promise<void>}
 */
export async function updateWordStateRTDB(
  gameId: string,
  wordId: string,
  wordData: Partial<Omit<Word, 'id' | 'text' | 'submittedByPlayerId'>>
): Promise<void> {
  try {
    await update(ref(rtdb, `games/${gameId}/words/${wordId}`), wordData);
    console.log(`Word ${wordId} updated in game ${gameId}`);
  } catch (error) {
    console.error(`Error updating word ${wordId} in game ${gameId}:`, error);
    throw new Error("Failed to update word state.");
  }
}

/**
 * Deletes a word from a game.
 * @param {string} gameId - The ID of the game.
 * @param {string} wordId - The ID of the word to delete.
 * @returns {Promise<void>}
 */
export async function deleteWordRTDB(gameId: string, wordId: string): Promise<void> {
  try {
    // Check if the game is in 'lobby' state
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (gameSnapshot.exists()) {
      const gameData = gameSnapshot.val();
      if (gameData.state !== 'lobby') {
        throw new Error("Words can only be deleted when the game is in the lobby state.");
      }
    } else {
      throw new Error(`Game ${gameId} not found.`);
    }
    
    // Delete the word
    await remove(ref(rtdb, `games/${gameId}/words/${wordId}`));
    console.log(`Word ${wordId} deleted from game ${gameId}`);
  } catch (error) {
    console.error(`Error deleting word ${wordId} from game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Updates the game state.
 * @param {string} gameId - The ID of the game.
 * @param {Partial<Omit<Game, 'id' | 'code' | 'createdAt'>>} gameData - The game data to update.
 * @returns {Promise<void>}
 */
export async function updateGameStateRTDB(
  gameId: string,
  gameData: Partial<Omit<Game, 'id' | 'code' | 'createdAt'>>
): Promise<void> {
  try {
    await update(ref(rtdb, `games/${gameId}`), gameData);
    console.log(`Game ${gameId} state updated`);
  } catch (error) {
    console.error(`Error updating game ${gameId} state:`, error);
    throw new Error("Failed to update game state.");
  }
}

/**
 * Start the game by transitioning from 'lobby' to 'round1'.
 * @param {string} gameId - The ID of the game.
 * @param {string[]} turnOrder - Array of team IDs in turn order.
 * @returns {Promise<void>}
 */
export async function startGameRTDB(gameId: string, turnOrder: string[]): Promise<void> {
  try {
    // Check if valid turnOrder was provided
    if (!turnOrder || turnOrder.length < 2) {
      throw new Error("At least two teams are required to start the game.");
    }
    
    // Check if each team in turnOrder exists
    for (const teamId of turnOrder) {
      const teamSnapshot = await get(ref(rtdb, `games/${gameId}/teams/${teamId}`));
      if (!teamSnapshot.exists()) {
        throw new Error(`Team ${teamId} in turn order does not exist.`);
      }
    }
    
    // Get the first team and a player from that team
    const playersSnapshot = await get(ref(rtdb, `games/${gameId}/players`));
    if (!playersSnapshot.exists()) {
      throw new Error("No players found in the game.");
    }
    
    const playersData = playersSnapshot.val();
    let firstActivePlayerId = null;
    
    // Find a player from the first team in turnOrder
    for (const [playerId, playerData] of Object.entries(playersData)) {
      if ((playerData as any).teamId === turnOrder[0]) {
        firstActivePlayerId = playerId;
        break;
      }
    }
    
    if (!firstActivePlayerId) {
      throw new Error(`No players found in the first team (${turnOrder[0]}).`);
    }
    
    // Update the game state to start the game
    const gameUpdateData = {
      state: 'round1',
      currentRound: 1,
      activeTeamId: turnOrder[0],
      activePlayerId: firstActivePlayerId,
      turnOrder,
      turnStartTime: Date.now()
    };
    
    await update(ref(rtdb, `games/${gameId}`), gameUpdateData);
    console.log(`Game ${gameId} started with turn order: ${turnOrder.join(', ')}`);
  } catch (error) {
    console.error(`Error starting game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Advances to the next round.
 * @param {string} gameId - The ID of the game.
 * @returns {Promise<void>}
 */
export async function advanceToNextRoundRTDB(gameId: string): Promise<void> {
  try {
    // Get the current game state
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (!gameSnapshot.exists()) {
      throw new Error(`Game ${gameId} not found.`);
    }
    
    const gameData = gameSnapshot.val();
    let nextState: string;
    let nextRound: number | null;
    
    // Determine the next state based on current state
    switch (gameData.state) {
      case 'round1':
        nextState = 'round2';
        nextRound = 2;
        break;
      case 'round2':
        nextState = 'round3';
        nextRound = 3;
        break;
      case 'round3':
        nextState = 'finished';
        nextRound = null;
        break;
      default:
        throw new Error(`Cannot advance from current state: ${gameData.state}`);
    }
    
    // If we're finishing the game, clear active players/teams
    if (nextState === 'finished') {
      await update(ref(rtdb, `games/${gameId}`), {
        state: nextState,
        currentRound: nextRound,
        activeTeamId: null,
        activePlayerId: null,
        turnStartTime: null
      });
    } else {
      // Otherwise, set up the next round with the first team and player
      const firstTeamId = gameData.turnOrder[0];
      
      // Find a player from the first team
      const playersSnapshot = await get(ref(rtdb, `games/${gameId}/players`));
      
      if (!playersSnapshot.exists()) {
        throw new Error("No players found in the game.");
      }
      
      const playersData = playersSnapshot.val();
      let firstActivePlayerId = null;
      
      for (const [playerId, playerData] of Object.entries(playersData)) {
        if ((playerData as any).teamId === firstTeamId) {
          firstActivePlayerId = playerId;
          break;
        }
      }
      
      if (!firstActivePlayerId) {
        throw new Error(`No players found in the first team (${firstTeamId}).`);
      }
      
      await update(ref(rtdb, `games/${gameId}`), {
        state: nextState,
        currentRound: nextRound,
        activeTeamId: firstTeamId,
        activePlayerId: firstActivePlayerId,
        turnStartTime: Date.now()
      });
    }
    
    console.log(`Game ${gameId} advanced to ${nextState}`);
  } catch (error) {
    console.error(`Error advancing game ${gameId} to next round:`, error);
    throw error;
  }
}

/**
 * Advances the turn to the next player or team.
 * @param {string} gameId - The ID of the game.
 * @returns {Promise<void>}
 */
export async function advanceToNextTurnRTDB(gameId: string): Promise<void> {
  try {
    // Get current game state
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (!gameSnapshot.exists()) {
      throw new Error(`Game ${gameId} not found.`);
    }
    
    const gameData = gameSnapshot.val();
    
    // If we're not in an active round, can't advance turns
    if (gameData.state === 'lobby' || gameData.state === 'finished') {
      throw new Error(`Cannot advance turns in game state: ${gameData.state}`);
    }
    
    // Get all teams
    const teamsSnapshot = await get(ref(rtdb, `games/${gameId}/teams`));
    if (!teamsSnapshot.exists()) {
      throw new Error("No teams found in the game.");
    }
    
    // Get all players
    const playersSnapshot = await get(ref(rtdb, `games/${gameId}/players`));
    if (!playersSnapshot.exists()) {
      throw new Error("No players found in the game.");
    }
    
    const playersData = playersSnapshot.val();
    
    // Determine the next team's turn
    const currentTeamIndex = gameData.turnOrder.findIndex(
      (teamId: string) => teamId === gameData.activeTeamId
    );
    
    if (currentTeamIndex === -1) {
      throw new Error("Current active team not found in turn order.");
    }
    
    // Get the next team in the rotation
    const nextTeamIndex = (currentTeamIndex + 1) % gameData.turnOrder.length;
    const nextTeamId = gameData.turnOrder[nextTeamIndex];
    
    // Find a player from the next team
    let nextPlayerId = null;
    for (const [playerId, playerData] of Object.entries(playersData)) {
      if ((playerData as any).teamId === nextTeamId) {
        nextPlayerId = playerId;
        break;
      }
    }
    
    if (!nextPlayerId) {
      throw new Error(`No players found in the next team (${nextTeamId}).`);
    }
    
    // Update the game state with the new active team and player
    await update(ref(rtdb, `games/${gameId}`), {
      activeTeamId: nextTeamId,
      activePlayerId: nextPlayerId,
      turnStartTime: Date.now()
    });
    
    console.log(`Game ${gameId} advanced to next turn: Team ${nextTeamId}, Player ${nextPlayerId}`);
  } catch (error) {
    console.error(`Error advancing to next turn in game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Marks a word as guessed in the current round and updates team score.
 * @param {string} gameId - The ID of the game.
 * @param {string} wordId - The ID of the word that was guessed.
 * @returns {Promise<void>}
 */
export async function markWordAsGuessedRTDB(gameId: string, wordId: string): Promise<void> {
  try {
    // Get current game state
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (!gameSnapshot.exists()) {
      throw new Error(`Game ${gameId} not found.`);
    }
    
    const gameData = gameSnapshot.val();
    
    // Determine which round we're in
    const currentRound = gameData.currentRound;
    if (!currentRound || currentRound < 1 || currentRound > 3) {
      throw new Error(`Invalid current round: ${currentRound}`);
    }
    
    // Get the word
    const wordSnapshot = await get(ref(rtdb, `games/${gameId}/words/${wordId}`));
    if (!wordSnapshot.exists()) {
      throw new Error(`Word ${wordId} not found in game ${gameId}`);
    }
    
    const wordData = wordSnapshot.val();
    
    // Check if word is already guessed in this round
    const roundKey = `guessedInRound${currentRound}` as keyof Word;
    if (wordData[roundKey]) {
      throw new Error(`Word ${wordId} is already marked as guessed in round ${currentRound}`);
    }
    
    // Update the word to mark it as guessed in this round
    const wordUpdate = {
      [roundKey]: true
    };
    
    await update(ref(rtdb, `games/${gameId}/words/${wordId}`), wordUpdate);
    
    // Increment active team's score
    const activeTeamId = gameData.activeTeamId;
    if (!activeTeamId) {
      throw new Error("No active team found in the game.");
    }
    
    const teamSnapshot = await get(ref(rtdb, `games/${gameId}/teams/${activeTeamId}`));
    if (!teamSnapshot.exists()) {
      throw new Error(`Active team ${activeTeamId} not found in game ${gameId}`);
    }
    
    const teamData = teamSnapshot.val();
    const currentScore = teamData.score || 0;
    
    // Update the team's score
    await update(ref(rtdb, `games/${gameId}/teams/${activeTeamId}`), {
      score: currentScore + 1
    });
    
    console.log(`Word ${wordId} marked as guessed in round ${currentRound} for team ${activeTeamId}`);
  } catch (error) {
    console.error(`Error marking word as guessed in game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Counts words that are guessed in a specific round.
 * @param {string} gameId - The ID of the game.
 * @param {number} round - The round number (1, 2, or 3).
 * @returns {Promise<{ total: number, guessed: number }>} The total and guessed word counts.
 */
export async function getWordCountsForRoundRTDB(
  gameId: string,
  round: number
): Promise<{ total: number, guessed: number }> {
  try {
    // Check if round is valid
    if (round < 1 || round > 3) {
      throw new Error(`Invalid round number: ${round}`);
    }
    
    // Get all words
    const wordsSnapshot = await get(ref(rtdb, `games/${gameId}/words`));
    if (!wordsSnapshot.exists()) {
      return { total: 0, guessed: 0 };
    }
    
    const wordsData = wordsSnapshot.val();
    const words = Object.values(wordsData);
    
    // Count total words and guessed words
    const total = words.length;
    const roundKey = `guessedInRound${round}`;
    const guessed = words.filter((word: any) => word[roundKey]).length;
    
    return { total, guessed };
  } catch (error) {
    console.error(`Error getting word counts for round ${round} in game ${gameId}:`, error);
    throw error;
  }
}

/**
 * Verification service to check if a game is ready to start.
 * @param {string} gameId - The ID of the game.
 * @returns {Promise<{ valid: boolean, errors: string[] }>} Validation result with any errors.
 */
export async function verifyGameCanStartRTDB(
  gameId: string
): Promise<{ valid: boolean, errors: string[] }> {
  try {
    const errors: string[] = [];
    
    // Get game data
    const gameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (!gameSnapshot.exists()) {
      errors.push(`Game ${gameId} not found.`);
      return { valid: false, errors };
    }
    
    const gameData = gameSnapshot.val();
    
    // Check if game is in lobby state
    if (gameData.state !== 'lobby') {
      errors.push(`Game is already in progress or finished. Current state: ${gameData.state}`);
    }
    
    // Get teams
    const teamsSnapshot = await get(ref(rtdb, `games/${gameId}/teams`));
    if (!teamsSnapshot.exists() || Object.keys(teamsSnapshot.val()).length < 2) {
      errors.push("At least two teams are required to start the game.");
    } else {
      const teamsData = teamsSnapshot.val();
      
      // Get players
      const playersSnapshot = await get(ref(rtdb, `games/${gameId}/players`));
      if (!playersSnapshot.exists()) {
        errors.push("No players found in the game.");
      } else {
        const playersData = playersSnapshot.val();
        const players = Object.entries(playersData).map(([id, data]) => ({
          id,
          ...data as Omit<Player, 'id'>
        }));
        
        // Check if each team has at least 2 players
        const teamsWithPlayers = new Map<string, number>();
        
        for (const player of players) {
          if (player.teamId) {
            const currentCount = teamsWithPlayers.get(player.teamId) || 0;
            teamsWithPlayers.set(player.teamId, currentCount + 1);
          }
        }
        
        const teamsWithNotEnoughPlayers = Object.entries(teamsData)
          .filter(([teamId]) => (teamsWithPlayers.get(teamId) || 0) < 2)
          .map(([_, data]) => (data as any).name);
        
        if (teamsWithNotEnoughPlayers.length > 0) {
          errors.push(
            `The following teams need at least 2 players: ${teamsWithNotEnoughPlayers.join(", ")}`
          );
        }
        
        // Get words
        const wordsSnapshot = await get(ref(rtdb, `games/${gameId}/words`));
        if (!wordsSnapshot.exists()) {
          errors.push("No words found in the game.");
        } else {
          const wordsData = wordsSnapshot.val();
          const words = Object.entries(wordsData).map(([id, data]) => ({
            id,
            ...data as Omit<Word, 'id'>
          }));
          
          // Check if each player has submitted 5 words
          const playerWordCounts = new Map<string, number>();
          
          for (const word of words) {
            const currentCount = playerWordCounts.get(word.submittedByPlayerId) || 0;
            playerWordCounts.set(word.submittedByPlayerId, currentCount + 1);
          }
          
          const playersWithNotEnoughWords = players
            .filter(player => (playerWordCounts.get(player.id) || 0) < 5)
            .map(player => player.name);
          
          if (playersWithNotEnoughWords.length > 0) {
            errors.push(
              `The following players need to add 5 words: ${playersWithNotEnoughWords.join(", ")}`
            );
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error(`Error verifying game ${gameId} can start:`, error);
    throw error;
  }
} 