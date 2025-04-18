import React from 'react';
import Badge from './Badge';
import Card from './Card';

interface CurrentTurnInfoProps {
  teamName: string;
  playerName: string;
  isCurrentPlayer: boolean;
  className?: string;
}

export default function CurrentTurnInfo({
  teamName,
  playerName,
  isCurrentPlayer,
  className = ''
}: CurrentTurnInfoProps) {
  return (
    <Card className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-bold font-poppins">Current Turn</h3>
      </div>
      
      <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-dark">
                Team: <span className="font-semibold text-sky-700">{teamName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-dark">
                Player: <span className="font-semibold text-sky-700">{playerName}</span>
                {isCurrentPlayer && (
                  <Badge variant="primary" size="sm" className="ml-2 inline-flex items-center">
                    You
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 