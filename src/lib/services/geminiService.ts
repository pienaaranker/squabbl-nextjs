import { WORD_CATEGORIES, type GenerationContext } from '../utils/wordCategories';

/**
 * Generates words based on a description using Gemini
 * @param description - User's description of the type of words they want
 * @param count - Number of words to generate (default: 5)
 * @param context - Optional generation context with category and previous words
 * @returns Array of generated words
 */
export async function generateWords(
  description: string, 
  count: number = 5,
  context?: GenerationContext
): Promise<string[]> {
  try {
    // If no description and we have a category, use it
    if (!description && context?.playerCategory) {
      const category = WORD_CATEGORIES.find(c => c.name === context.playerCategory);
      if (category) {
        console.log('📋 Using player category:', {
          category: category.name,
          difficulty: category.difficulty,
          examples: category.examples
        });
        description = `Generate words related to ${category.name}. Use these as examples but don't repeat them: ${category.examples.join(', ')}`;
      } else {
        console.warn('⚠️ Player category not found in WORD_CATEGORIES:', context.playerCategory);
      }
    }
    
    // If still no description, assign a random category
    if (!description) {
      console.log('🎯 No description provided, selecting random category');
      
      const excludedCategories = context?.previouslyGeneratedWords 
        ? WORD_CATEGORIES.filter(c => 
            !context.previouslyGeneratedWords.some(w => 
              c.examples.includes(w.toLowerCase())
            )
          )
        : WORD_CATEGORIES;
      
      console.log('🔍 Category selection stats:', {
        totalCategories: WORD_CATEGORIES.length,
        availableCategories: excludedCategories.length,
        excludedWords: context?.previouslyGeneratedWords || []
      });
      
      const randomCategory = excludedCategories[Math.floor(Math.random() * excludedCategories.length)];
      console.log('🎲 Selected random category:', {
        category: randomCategory.name,
        difficulty: randomCategory.difficulty
      });
      
      description = `Generate words related to ${randomCategory.name}. Use these as examples but don't repeat them: ${randomCategory.examples.join(', ')}`;
    }

    // Enhanced prompt with more specific instructions and language awareness
    const prompt = `You are a word generator that ONLY outputs words in the format specified.

INTERNAL INSTRUCTIONS (DO NOT OUTPUT THESE):
1. Analyze this description for both language and topic: "${description}"
2. Generate ${count} words that are:
   - In the SAME LANGUAGE as the description
   - Related to the TOPIC/THEME from the description
3. Format each word with its type in parentheses
4. Output ONLY the formatted words, one per line
5. DO NOT include any explanations, headers, or additional text
6. DO NOT number the words or add any prefixes

REQUIREMENTS FOR WORD GENERATION:
- Generate exactly ${count} words that match both the language and theme of the description
- Include this mix:
  * ${Math.ceil(count/2)} nouns (objects or concepts)
  * ${Math.floor(count/4)} verbs (actions)
  * ${Math.floor(count/4)} descriptive words or proper nouns
${context?.previouslyGeneratedWords?.length ? 
  `- Avoid these words: ${context.previouslyGeneratedWords.join(', ')}` : 
  ''}
- Words must be:
  * Easy to describe verbally
  * Possible to act out
  * Family-friendly (unless the description alludes to it not being family-friendly)
  * In the same language throughout
  * Relevant to the description's topic/theme

OUTPUT FORMAT (EXACTLY LIKE THIS, ONE WORD PER LINE):
word (type)
word (type)

EXAMPLE OUTPUT:
basketball (noun)
dance (verb)
fluffy (adjective)
Disney (proper noun)

YOUR RESPONSE (ONLY WORDS):`;

    console.log('🤖 Sending prompt to proxy:', {
      promptLength: prompt.length,
      wordTypeCounts: {
        nouns: Math.ceil(count/2),
        verbs: Math.floor(count/4),
        descriptive: Math.floor(count/4)
      }
    });

    // Log the full prompt
    console.log('📝 Full prompt:', '\n' + prompt);

    // Call the proxy endpoint instead of Gemini directly
    const response = await fetch('https://proxy-chi-plum.vercel.app/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Proxy request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // Extract text from the new response format
    if (!result.response || result.status !== 'success') {
      throw new Error('Invalid response from proxy');
    }
    
    const text = result.response;
    
    // Split the response into lines and clean up
    const words = text
      .split('\n')
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0)
      .map((word: string) => word.replace(/\s*\([^)]*\)/, '')) // Remove the (type) annotations
      .slice(0, count); // Ensure we only get the requested number of words

    // Log the full prompt
    console.log('📝 Full words:', '\n' + words);
    
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
    console.error('Error generating words with proxy:', error);
    throw new Error('Failed to generate words. Please try again.');
  }
} 