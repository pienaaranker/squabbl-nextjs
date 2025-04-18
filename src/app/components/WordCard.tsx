import React from 'react';
import Button from './Button';
import Card from './Card';
import Timer from './Timer';
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
  seconds: number;
  totalSeconds: number;
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
  seconds,
  totalSeconds,
  className = ''
}: WordCardProps) {
  if (isDescriber) {
    return (
      <Card 
        className={`relative ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold font-poppins">Your Word</h3>
          <Timer 
            seconds={seconds} 
            totalSeconds={totalSeconds} 
            className="scale-75 sm:scale-100"
          />
        </div>
        
        <div className="bg-coral-50 border-2 border-coral-200 rounded-lg p-4 mb-4">
          <p className="text-center text-xl sm:text-2xl font-bold text-coral-600">
            {currentWord?.text || "Loading word..."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            onClick={onCorrectGuess}
            disabled={isCorrectGuessProcessing || !currentWord}
            variant="success"
            size="lg"
            className="flex-1 bg-[#B0EACD] hover:bg-[#9DDCBF] text-[#2F4F4F] text-sm sm:text-base py-3"
            isLoading={isCorrectGuessProcessing}
            loadingText="Processing..."
            leftIcon={<span className="text-lg sm:text-xl">✓</span>}
          >
            Correct!
          </Button>
          
          <Button
            onClick={onSkip}
            disabled={isSkipProcessing || !currentWord}
            variant="warning"
            size="lg"
            className="flex-1 bg-[#FFD166] hover:bg-[#F5C14F] text-[#2F4F4F] text-sm sm:text-base py-3"
            isLoading={isSkipProcessing}
            loadingText="Skipping..."
            leftIcon={<span className="text-lg sm:text-xl">⟳</span>}
          >
            Skip (-10s)
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-bold font-poppins">
          {isOnActiveTeam ? "Guess the word!" : "Watch and wait"}
        </h3>
        <Timer 
          seconds={seconds} 
          totalSeconds={totalSeconds} 
          className="scale-75 sm:scale-100"
        />
      </div>
      
      <div className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-4">
        <p className="text-center text-sm sm:text-base text-neutral-dark">
          {isOnActiveTeam 
            ? "Listen to your teammate's clues and guess the word!"
            : `${activePlayerName} is trying to get their team to guess the word.`
          }
        </p>
      </div>
    </Card>
  );
} 