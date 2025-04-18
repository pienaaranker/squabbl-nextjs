import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerationContext, WORD_CATEGORIES } from "../utils/wordCategories";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Generates unique words based on description and context
 * @param description - User's description of the type of words they want
 * @param count - Number of words to generate (default: 5)
 * @param context - Generation context including game state and previous words
 * @returns Array of generated words
 */
export async function generateWords(
  description: string = '',
  count: number = 5,
  context?: GenerationContext
): Promise<string[]> {
  console.log('🎲 Starting word generation:', {
    description,
    count,
    playerCategory: context?.playerCategory,
    teamName: context?.teamName
  });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
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

    console.log('🤖 Sending prompt to Gemini:', {
      promptLength: prompt.length,
      wordTypeCounts: {
        nouns: Math.ceil(count/2),
        verbs: Math.floor(count/4),
        descriptive: Math.floor(count/4)
      }
    });

    // Log the full prompt
    console.log('📝 Full prompt:', '\n' + prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✨ Raw Gemini response:', text);
    
    // Parse and clean up the response
    const words = text
      .split('\n')
      .map(line => line.replace(/\s*\([^)]*\)/, '').trim()) // Remove the type annotations
      .filter(word => 
        word.length > 0 && 
        (!context?.previouslyGeneratedWords?.includes(word.toLowerCase()))
      )
      .slice(0, count);
    
    console.log('✅ Processed words:', {
      requested: count,
      generated: words.length,
      words
    });
    
    // If we didn't get enough words, pad with category-specific defaults
    if (words.length < count && context?.playerCategory) {
      console.log('⚠️ Not enough words generated, attempting to pad with defaults');
      
      const category = WORD_CATEGORIES.find(c => c.name === context.playerCategory);
      if (category) {
        console.log('🔄 Using category defaults:', {
          category: category.name,
          availableExamples: category.examples
        });
        
        const availableDefaults = category.examples.filter(w => 
          !words.includes(w) && 
          !context.previouslyGeneratedWords?.includes(w)
        );
        
        while (words.length < count && availableDefaults.length > 0) {
          const randomDefault = availableDefaults.splice(
            Math.floor(Math.random() * availableDefaults.length), 
            1
          )[0];
          words.push(randomDefault);
          console.log('➕ Added default word:', randomDefault);
        }
      } else {
        console.warn('⚠️ Could not find category for defaults:', context.playerCategory);
      }
    }
    
    console.log('🏁 Final word list:', {
      count: words.length,
      words,
      description: description.substring(0, 100) + (description.length > 100 ? '...' : '')
    });
    
    return words;
  } catch (error) {
    console.error('❌ Error generating words:', {
      error,
      description,
      playerCategory: context?.playerCategory,
      previousWords: context?.previouslyGeneratedWords
    });
    throw new Error('Failed to generate words. Please try again.');
  }
} 