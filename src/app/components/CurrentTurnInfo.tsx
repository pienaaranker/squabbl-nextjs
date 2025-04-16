import React from 'react';
import Badge from './Badge';
import Card from './Card';
import Timer from './Timer';

interface CurrentTurnInfoProps {
  teamName: string;
  playerName: string;
  isCurrentPlayer: boolean;
  seconds: number;
  totalSeconds: number;
  className?: string;
}

export default function CurrentTurnInfo({
  teamName,
  playerName,
  isCurrentPlayer,
  seconds,
  totalSeconds,
  className = ''
}: CurrentTurnInfoProps) {
  return (
    <Card className={`relative ${className}`} title="Current Turn">
      {!isCurrentPlayer && (
        <div className="absolute top-2 right-2 z-10">
          <Timer seconds={seconds} totalSeconds={totalSeconds} className="scale-50 origin-top-right" />
        </div>
      )}
      
      <p className="text-slate-700">
        Team: <span className="font-semibold">{teamName}</span>
      </p>
      <p className="text-slate-700">
        Player: <span className="font-semibold">{playerName}</span>
        {isCurrentPlayer && <Badge variant="primary" size="sm" className="ml-2">You</Badge>}
      </p>
    </Card>
  );
} 