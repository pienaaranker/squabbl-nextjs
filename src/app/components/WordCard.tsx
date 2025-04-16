import React from 'react';
import Button from './Button';
import Card from './Card';
import type { Word } from '@/types/firestore';

interface WordCardProps {
  isDescriber: boolean;
  isOnActiveTeam: boolean;
  currentWord: Word | null;
  activePlayerName: string;
  onCorrectGuess: () => void;
  onSkip: () => void;
  isCorrectGuessProcessing: boolean;
  isSkipProcessing: boolean;
  className?: string;
}

export default function WordCard({
  isDescriber,
  isOnActiveTeam,
  currentWord,
  activePlayerName,
  onCorrectGuess,
  onSkip,
  isCorrectGuessProcessing,
  isSkipProcessing,
  className = ''
}: WordCardProps) {
  if (isDescriber) {
    return (
      <Card 
        className={`border-2 border-coral-500 ${className}`} 
        title="Your Word"
        headerClassName="text-center"
      >
        <p className="text-center text-3xl font-bold text-coral-600 mb-6">
          {currentWord?.text || "Loading word..."}
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onCorrectGuess}
            disabled={isCorrectGuessProcessing || !currentWord}
            variant="success"
            isLoading={isCorrectGuessProcessing}
            loadingText="Processing..."
          >
            Correct!
          </Button>
          
          <Button
            onClick={onSkip}
            disabled={isSkipProcessing || !currentWord}
            variant="warning"
            isLoading={isSkipProcessing}
            loadingText="Skipping..."
          >
            Skip (-10s)
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card 
      className={className}
      title={isOnActiveTeam ? "Guess the word!" : "Watch and wait for your team's turn!"}
      headerClassName="text-center"
    >
      <p className="text-center text-xl text-slate-600 mb-2">
        {isOnActiveTeam 
          ? "Listen to your teammate's clues and guess the word!"
          : `${activePlayerName} is trying to get their team to guess the word.`
        }
      </p>
    </Card>
  );
} 