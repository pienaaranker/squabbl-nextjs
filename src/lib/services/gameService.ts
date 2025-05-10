import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateWords } from './geminiService';
import { Player } from '../../types/firestore';
import { GenerationContext } from '../utils/wordCategories';

// Helper function to get a player's words
async function getPlayerWords(gameId: string, playerId: string): Promise<any[]> {
  // Implementation of getPlayerWords
  return []; // TODO: Implement this
}

// Helper function to add a word
async function addWord(gameId: string, playerId: string, word: string): Promise<string> {
  // Implementation of addWord
  return ''; // TODO: Implement this
}

export async function addAIWords(
  gameId: string,
  playerId: string,
  description: string = '',
  count: number = 5,
  wordLimit: number = 5
): Promise<string[]> {
  try {
    // Check current word count for this player
    const playerWords = await getPlayerWords(gameId, playerId);
    const remainingSlots = wordLimit - playerWords.length;
    
    if (remainingSlots <= 0) {
      throw new Error(`You've reached the maximum limit of ${wordLimit} words per player.`);
    }

    // Adjust count to not exceed the remaining slots
    const adjustedCount = Math.min(count, remainingSlots);

    // Get player info for category
    const playerRef = doc(db, "games", gameId, "players", playerId);
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists()) {
      throw new Error("Player not found");
    }
    const player = playerSnap.data() as Player;
    
    // Create generation context
    const context: GenerationContext = {
      gameId,
      playerId,
      previouslyGeneratedWords: playerWords,
      playerCategory: player.assignedCategory // Using assignedCategory instead of category
    };
    
    // Generate words using Gemini with context
    const words = await generateWords(description, adjustedCount, context);
    
    // Add the words to the game
    const wordIds: string[] = [];
    for (const word of words) {
      const wordId = await addWord(gameId, playerId, word);
      wordIds.push(wordId);
    }
    return wordIds;
  } catch (error) {
    console.error(`Error adding AI words to game ${gameId}:`, error);
    throw error instanceof Error ? error : new Error("Failed to add AI words.");
  }
} 