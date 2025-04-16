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
        className={`border-2 border-coral-500 relative ${className}`} 
        title="Your Word"
        headerClassName="text-center"
      >
        <div className="absolute top-2 right-2 z-10">
          <Timer seconds={seconds} totalSeconds={totalSeconds} className="scale-50 origin-top-right" />
        </div>
        
        <p className="text-center text-3xl font-bold text-coral-600 mb-8">
          {currentWord?.text || "Loading word..."}
        </p>
        
        <div className="flex gap-6 justify-center items-center">
          <Button
            onClick={onCorrectGuess}
            disabled={isCorrectGuessProcessing || !currentWord}
            variant="success"
            size="lg"
            className="min-w-[160px] shadow-lg bg-[#B0EACD] hover:bg-[#9DDCBF] text-[#2F4F4F]"
            isLoading={isCorrectGuessProcessing}
            loadingText="Processing..."
            leftIcon={<span className="text-xl">✓</span>}
          >
            Correct!
          </Button>
          
          <Button
            onClick={onSkip}
            disabled={isSkipProcessing || !currentWord}
            variant="warning"
            size="lg"
            className="min-w-[160px] shadow-lg bg-[#FFD166] hover:bg-[#F5C14F] text-[#2F4F4F]"
            isLoading={isSkipProcessing}
            loadingText="Skipping..."
            leftIcon={<span className="text-xl">⟳</span>}
          >
            Skip (-10s)
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card 
      className={`relative ${className}`}
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