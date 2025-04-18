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
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Get Ready!</h2>
          <div className="space-y-4">
            <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-sky-800">
                {teamName}&apos;s Turn
              </p>
              <p className="text-md text-sky-700">
                {playerName} will be describing
                {isDescriber && <Badge variant="primary" size="sm" className="ml-2">That&apos;s you!</Badge>}
              </p>
            </div>
            
            <div className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                {roundName}
              </h3>
              <p className="text-neutral-600">
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
              className="animate-pulse"
            >
              Start Your Turn
            </Button>
          </div>
        ) : (
          <p className="text-center text-neutral-600">
            Waiting for {playerName} to start their turn...
          </p>
        )}
      </Card>
    </div>
  );
} 