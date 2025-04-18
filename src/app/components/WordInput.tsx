import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { AnimatedIcon } from './ui';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import { Word, Player } from '@/types/firestore';

interface WordInputProps {
  words: Word[];
  newWord: string;
  setNewWord: (word: string) => void;
  isAddingAIWords: boolean;
  isRemovingWord: string | null;
  wordError: string | null;
  playerId: string | null;
  players: Player[];
  gameState: string;
  onAddWord: (e: React.FormEvent) => void;
  onAddAIWords: () => void;
  onRemoveWord: (wordId: string) => void;
}

const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

export default function WordInput({
  words,
  newWord,
  setNewWord,
  isAddingAIWords,
  isRemovingWord,
  wordError,
  playerId,
  players,
  gameState,
  onAddWord,
  onAddAIWords,
  onRemoveWord,
}: WordInputProps) {
  const currentPlayer = players.find(p => p.id === playerId);
  const playerCategory = currentPlayer?.assignedCategory;

  return (
    <Card className="w-full p-1 sm:p-2 md:p-4 bg-red-200">
      {/* Header with Title and Word Count */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-bold font-poppins">Add Words</h3>
        <h3 className="text-xs sm:text-sm font-bold text-neutral-dark">({words.length}/5)</h3>
      </div>

      {/* Player's Category Display */}
      {playerCategory && (
        <div className="mb-2 p-2 bg-white rounded-lg">
          <p className="text-xs text-neutral-dark">
            Your assigned category: <span className="font-semibold">{playerCategory}</span>
          </p>
          <p className="text-xs text-neutral-dark mt-1">
            You can either add words manually or let AI generate words based on your category or a custom description.
          </p>
        </div>
      )}

      {/* Word Input Form */}
      <form onSubmit={onAddWord} className="mb-2">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="p-2 border-2 rounded-lg text-sm"
            placeholder={playerCategory 
              ? `Enter a word or describe ${playerCategory.toLowerCase()} related words`
              : "Enter a word or describe words to generate"}
            disabled={words.length >= 5}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              type="submit"
              isLoading={false}
              className="grow sm:grow-0 h-10"
              rightIcon={<span>✏️</span>}
              disabled={!newWord.trim() || words.length >= 5}
            >
              Add Word
            </Button>
            <Button
              variant="secondary"
              onClick={onAddAIWords}
              disabled={isAddingAIWords || !playerId || gameState !== 'lobby' || words.length >= 5}
              className="grow sm:grow-0 h-10"
              rightIcon={<AnimatedIcon icon={isAddingAIWords ? "🤖" : "✨"} />}
            >
              {isAddingAIWords ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </form>

      {/* Word List */}
      <AnimatePresence>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
          {words.map((word, index) => (
            <motion.div
              key={word.id}
              variants={listItemVariants}
              custom={index}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative group bg-white rounded-lg border-2 border-neutral-light hover:border-primary transition-colors p-2 flex justify-between items-center"
            >
              <p className="font-medium text-sm break-all pr-2">{word.text}</p>
              <motion.button
                className="p-1.5 rounded-full text-neutral hover:text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => onRemoveWord(word.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Remove word ${word.text}`}
                disabled={isRemovingWord === word.id}
              >
                {isRemovingWord === word.id ? <LoadingSpinner size="sm" /> : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Error Display */}
      {wordError && (
        <p className="text-red-500 text-sm mt-2">{wordError}</p>
      )}
    </Card>
  );
} 