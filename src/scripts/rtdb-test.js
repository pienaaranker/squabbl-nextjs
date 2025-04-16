// Test script for creating RTDB structure
import { rtdb } from '../lib/firebase/config';
import { ref, set, push, serverTimestamp } from 'firebase/database';

async function createTestRTDBStructure() {
  try {
    // Generate a unique game ID
    const gamesRef = ref(rtdb, 'games');
    const newGameRef = push(gamesRef);
    const gameId = newGameRef.key;
    const gameCode = 'TEST1';
    
    // Create the game record
    const gameData = {
      code: gameCode,
      state: 'lobby',
      currentRound: null,
      activeTeamId: null,
      activePlayerId: null,
      turnOrder: [],
      createdAt: Date.now(),
      turnStartTime: null,
    };
    
    // Set the game data
    await set(ref(rtdb, `games/${gameId}`), gameData);
    
    // Create an index entry for fast lookup by code
    await set(ref(rtdb, `game_codes/${gameCode}`), gameId);
    
    // Add a test team
    const teamRef = push(ref(rtdb, `games/${gameId}/teams`));
    const teamId = teamRef.key;
    await set(teamRef, {
      name: 'Test Team',
      score: 0
    });
    
    // Add a test player
    const playerRef = push(ref(rtdb, `games/${gameId}/players`));
    const playerId = playerRef.key;
    await set(playerRef, {
      name: 'Test Player',
      teamId: teamId,
      isHost: true,
      joinedAt: Date.now()
    });
    
    // Add a test word
    await set(push(ref(rtdb, `games/${gameId}/words`)), {
      text: 'test word',
      submittedByPlayerId: playerId,
      guessedInRound1: false,
      guessedInRound2: false,
      guessedInRound3: false
    });
    
    console.log('Test RTDB structure created:');
    console.log(`Game ID: ${gameId}`);
    console.log(`Game Code: ${gameCode}`);
    console.log(`Team ID: ${teamId}`);
    console.log(`Player ID: ${playerId}`);
    
    return gameId;
  } catch (error) {
    console.error('Error creating test RTDB structure:', error);
    throw error;
  }
}

// Run the function and log the result
createTestRTDBStructure()
  .then(gameId => {
    console.log(`Successfully created test game with ID: ${gameId}`);
  })
  .catch(error => {
    console.error('Failed to create test structure:', error);
  }); 