import React from 'react';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';

interface PauseScreenProps {
  teamName: string;
  playerName: string;
  isDescriber: boolean;
  onStartTurn: () => void;
  roundName: string;
  roundInstructions: string;
}

export default function PauseScreen({
  teamName,
  playerName,
  isDescriber,
  onStartTurn,
  roundName,
  roundInstructions
}: PauseScreenProps) {
  // Determine round color
  let roundColor = 'text-[#A8DADC]'; // Default blue for Describe It
  let roundBorder = 'border-[#A8DADC]';
  if (roundName.toLowerCase().includes('act')) {
    roundColor = 'text-[#B0EACD]';
    roundBorder = 'border-[#B0EACD]';
  }
  if (roundName.toLowerCase().includes('one word')) {
    roundColor = 'text-[#FFD166]';
    roundBorder = 'border-[#FFD166]';
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border-4 border-[#B0EACD] p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-fredoka mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl">⏳</span>
            Get Ready!
          </h2>
          <div className="space-y-6">
            <div className="bg-[#F8F8F8] border-2 border-[#B0EACD] rounded-xl p-6">
              <p className="text-xl font-semibold text-[#2F4F4F] font-fredoka mb-1">
                {teamName}&apos;s Turn
              </p>
              <p className="text-lg text-[#2F4F4F] font-nunito">
                {playerName} will be describing
                {isDescriber && <Badge variant="primary" size="sm" className="ml-2">That&apos;s you!</Badge>}
              </p>
            </div>
            <div className={`bg-[#F8F8F8] border-2 rounded-xl p-6 ${roundBorder}`}>
              <h3 className={`text-2xl font-bold font-fredoka mb-2 ${roundColor}`}>
                {roundName}
              </h3>
              <p className="text-[#2F4F4F] text-lg font-nunito">
                {roundInstructions}
              </p>
            </div>
          </div>
        </div>
        {isDescriber ? (
          <div className="flex justify-center">
            <Button
              onClick={onStartTurn}
              variant="primary"
              size="lg"
              className="animate-pulse w-full max-w-xs py-4 px-8 bg-[#EF798A] text-white font-bold rounded-xl hover:bg-[#e86476] transition-colors duration-200 shadow-md hover:shadow-lg font-nunito text-lg"
            >
              Start Your Turn
            </Button>
          </div>
        ) : (
          <p className="text-center text-[#2F4F4F] text-lg font-nunito">
            Waiting for {playerName} to start their turn...
          </p>
        )}
      </div>
    </div>
  );
} 