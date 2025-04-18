import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Generates words based on a description using Gemini
 * @param description - User's description of the type of words they want
 * @param count - Number of words to generate (default: 5)
 * @returns Array of generated words
 */
export async function generateWords(description: string, count: number = 5): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    // Craft the prompt
    const prompt = `Generate exactly ${count} simple, family-friendly words based on this description: "${description}". 
    If no description is provided, generate random common nouns or verbs suitable for a family game.
    Rules:
    - Each word should be a single word (no phrases)
    - Words should be easy to describe or act out
    - Keep words family-friendly and appropriate for all ages (unless specified otherwise in the description)
    - Return ONLY the words, one per line, nothing else
    - No numbers, special characters, or punctuation`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split the response into lines and clean up
    const words = text
      .split('\n')
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0)
      .slice(0, count); // Ensure we only get the requested number of words
    
    // If we didn't get enough words, pad with some defaults
    const defaultWords = [
      "pizza", "dog", "cat", "beach", "mountain", "guitar", "piano", "dance",
      "sing", "jump", "run", "swim", "bicycle", "car", "airplane", "train"
    ];
    
    while (words.length < count) {
      const randomDefault = defaultWords[Math.floor(Math.random() * defaultWords.length)];
      if (!words.includes(randomDefault)) {
        words.push(randomDefault);
      }
    }
    
    return words;
  } catch (error) {
    console.error('Error generating words with Gemini:', error);
    throw new Error('Failed to generate words. Please try again.');
  }
} 