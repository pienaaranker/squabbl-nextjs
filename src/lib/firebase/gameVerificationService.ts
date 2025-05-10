import { collection, query, getDocs } from "firebase/firestore";
import { db } from "./config";
import type { Game, Team, Player, Word } from "@/types/firestore";

export interface VerificationResult {
  valid: boolean;
  errors: string[];
}

export class GameVerificationService {
  /**
   * Verifies if a game can be started based on its current state
   * @param gameId - The ID of the game to verify
   * @param teams - Array of teams in the game
   * @param players - Array of players in the game
   * @param isHost - Whether the current user is the host
   * @param wordLimit - The required number of words per player
   * @returns A VerificationResult with validation status and any error messages
   */
  static async verifyGameCanStart(
    gameId: string,
    teams: Team[],
    players: Player[],
    isHost: boolean,
    wordLimit: number = 5
  ): Promise<VerificationResult> {
    const errors: string[] = [];
    
    console.log("==== GAME VERIFICATION DETAILS ====");
    console.log(`Game ID: ${gameId}`);
    console.log(`Teams (${teams.length}):`, teams);
    console.log(`Players (${players.length}):`, players);
    console.log(`Is Host: ${isHost}`);
    
    // Verify host status
    if (!isHost) {
      console.log("❌ Validation failed: User is not the host");
      errors.push("Only the host can start the game");
    } else {
      console.log("✅ Validation passed: User is the host");
    }
    
    // Verify team count
    if (teams.length < 2) {
      console.log("❌ Validation failed: Not enough teams");
      errors.push("Need at least 2 teams to start the game");
    } else {
      console.log("✅ Validation passed: Enough teams");
    }
    
    // Verify each team has at least 2 players
    const teamsWithNotEnoughPlayers = teams.filter(team => {
      const teamPlayerCount = players.filter(p => p.teamId === team.id).length;
      console.log(`Team ${team.name} (${team.id}) has ${teamPlayerCount} players`);
      return teamPlayerCount < 2;
    });
    
    if (teamsWithNotEnoughPlayers.length > 0) {
      console.log("❌ Validation failed: Teams with not enough players:", teamsWithNotEnoughPlayers);
      errors.push(`The following teams need at least 2 players: ${teamsWithNotEnoughPlayers.map(t => t.name).join(", ")}`);
    } else {
      console.log("✅ Validation passed: All teams have enough players");
    }
    
    // Get all words
    const wordsQuery = query(collection(db, "games", gameId, "words"));
    const wordsSnapshot = await getDocs(wordsQuery);
    const allWords = wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Word));
    
    console.log(`Total words in game: ${allWords.length}`);
    
    // Verify each player has added the required number of words
    const playersWithNotEnoughWords = players.filter(player => {
      const playerWordCount = allWords.filter(w => w.submittedByPlayerId === player.id).length;
      console.log(`Player ${player.name} (${player.id}) has submitted ${playerWordCount} words`);
      return playerWordCount < wordLimit;
    });
    
    if (playersWithNotEnoughWords.length > 0) {
      console.log("❌ Validation failed: Players with not enough words:", playersWithNotEnoughWords);
      errors.push(`The following players need to add ${wordLimit} words: ${playersWithNotEnoughWords.map(p => p.name).join(", ")}`);
    } else {
      console.log("✅ Validation passed: All players have added enough words");
    }
    
    console.log("Final validation result:", errors.length === 0 ? "✅ PASSED" : "❌ FAILED");
    if (errors.length > 0) {
      console.log("Errors:", errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Fetches all words for a game
   * @param gameId - The ID of the game
   * @returns Promise resolving to array of words
   */
  static async getAllWords(gameId: string): Promise<Word[]> {
    const wordsQuery = query(collection(db, "games", gameId, "words"));
    const wordsSnapshot = await getDocs(wordsQuery);
    return wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Word));
  }
  
  /**
   * Checks if the given game state allows for starting the game
   * Used for UI decisions like disabling buttons
   * @param teams - Array of teams in the game
   * @param players - Array of players in the game
   * @param words - Array of words in the game, or gameId to fetch all words
   * @param isHost - Whether the current user is the host
   * @param wordLimit - The required number of words per player
   * @returns Whether the game can be started based on current state
   */
  static async canStartGame(
    teams: Team[],
    players: Player[],
    wordsOrGameId: Word[] | string,
    isHost: boolean,
    wordLimit: number = 5
  ): Promise<boolean> {
    // Host check
    if (!isHost) return false;
    
    // Team count check
    if (teams.length < 2) return false;
    
    // Players per team check
    if (teams.some(team => players.filter(p => p.teamId === team.id).length < 2)) return false;
    
    // Words per player check
    let words: Word[];
    if (typeof wordsOrGameId === 'string') {
      words = await this.getAllWords(wordsOrGameId);
    } else {
      words = wordsOrGameId;
    }
    
    if (players.some(player => words.filter(w => w.submittedByPlayerId === player.id).length < wordLimit)) return false;
    
    return true;
  }
  
  /**
   * Gets specific error messages for the current game state
   * @param teams - Array of teams in the game
   * @param players - Array of players in the game
   * @param words - Array of words in the game, or gameId to fetch all words
   * @param isHost - Whether the current user is the host
   * @param wordLimit - The required number of words per player
   * @returns Array of error messages explaining why the game can't start
   */
  static async getGameStartErrors(
    teams: Team[],
    players: Player[],
    wordsOrGameId: Word[] | string,
    isHost: boolean,
    wordLimit: number = 5
  ): Promise<string[]> {
    const errors: string[] = [];
    
    if (!isHost) {
      errors.push("Only the host can start the game");
    }
    
    if (teams.length < 2) {
      errors.push("Need at least 2 teams to start the game");
    }
    
    if (teams.some(team => players.filter(p => p.teamId === team.id).length < 2)) {
      errors.push("Each team needs at least 2 players");
    }
    
    // Words per player check
    let words: Word[];
    if (typeof wordsOrGameId === 'string') {
      words = await this.getAllWords(wordsOrGameId);
    } else {
      words = wordsOrGameId;
    }
    
    if (players.some(player => words.filter(w => w.submittedByPlayerId === player.id).length < wordLimit)) {
      errors.push(`Each player needs to add ${wordLimit} words`);
    }
    
    return errors;
  }
} 