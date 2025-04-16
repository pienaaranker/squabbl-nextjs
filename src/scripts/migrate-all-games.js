// Script to migrate all active games from Firestore to Realtime Database
import { db, rtdb } from '../lib/firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';

/**
 * Function to migrate a single game from Firestore to RTDB
 * @param {string} gameId - The ID of the game to migrate
 * @returns {Promise<boolean>} - Whether the migration was successful
 */
async function migrateGame(gameId) {
  try {
    console.log(`Starting migration for game ${gameId}...`);
    
    // 1. Get the game data from Firestore
    const gameDoc = await getDoc(doc(db, "games", gameId));
    if (!gameDoc.exists()) {
      console.error(`Game ${gameId} not found in Firestore`);
      return false;
    }
    
    // Extract game data
    const gameData = gameDoc.data();
    console.log(`Found game: ${gameData.code}`);
    
    // Check if game already exists in RTDB
    const rtdbGameSnapshot = await get(ref(rtdb, `games/${gameId}`));
    if (rtdbGameSnapshot.exists()) {
      console.log(`Game ${gameId} already exists in RTDB, skipping...`);
      return true;
    }
    
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
    console.error(`Migration error for game ${gameId}:`, error);
    return false;
  }
}

/**
 * Migrates all active games from Firestore to RTDB
 */
async function migrateAllGames() {
  try {
    // Get all games that are not finished
    const gamesQuery = query(collection(db, "games"), where("state", "!=", "finished"));
    const gamesSnapshot = await getDocs(gamesQuery);
    
    console.log(`Found ${gamesSnapshot.size} active games to migrate`);
    
    // Track migration statistics
    const stats = {
      total: gamesSnapshot.size,
      success: 0,
      failed: 0,
      skipped: 0
    };
    
    // Migrate each game
    for (const gameDoc of gamesSnapshot.docs) {
      const gameId = gameDoc.id;
      const success = await migrateGame(gameId);
      
      if (success) {
        stats.success++;
      } else {
        stats.failed++;
      }
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("Migration completed with the following results:");
    console.log(`Total games: ${stats.total}`);
    console.log(`Successfully migrated: ${stats.success}`);
    console.log(`Failed migrations: ${stats.failed}`);
    console.log(`Skipped (already migrated): ${stats.skipped}`);
    
    return stats;
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

// Command line options
const args = process.argv.slice(2);
const specificGameId = args[0];

if (specificGameId) {
  console.log(`Migrating single game: ${specificGameId}`);
  migrateGame(specificGameId)
    .then(success => {
      if (success) {
        console.log("Migration completed successfully!");
        process.exit(0);
      } else {
        console.error("Migration failed");
        process.exit(1);
      }
    })
    .catch(error => {
      console.error("Migration failed with error:", error);
      process.exit(1);
    });
} else {
  console.log("Migrating all active games...");
  migrateAllGames()
    .then(() => {
      console.log("All migrations completed!");
      process.exit(0);
    })
    .catch(error => {
      console.error("Migration failed with error:", error);
      process.exit(1);
    });
} 