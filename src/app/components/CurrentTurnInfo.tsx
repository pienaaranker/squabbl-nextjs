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
    <Card className={className} title="Current Turn">
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