import React from 'react';
import type { Team, Player } from '@/types/firestore';
import { motion } from 'framer-motion';
import { springs } from '@/lib/animations';
import Button from './Button';
import Badge from './Badge';

interface TeamCardProps {
  team: Team;
  players: Player[];
  isActive?: boolean;
  className?: string;
  onPlayerJoin?: (playerId: string) => void;
  isLoading?: boolean;
  activeSpeaker?: Player | null;
  showScore?: boolean;
}

export default function TeamCard({
  team,
  players,
  isActive = false,
  className = '',
  onPlayerJoin,
  isLoading = false,
  activeSpeaker = null,
  showScore = false
}: TeamCardProps) {
  return (
    <div 
      className={`
        p-4 rounded-lg border-2
        ${isActive ? 'bg-sky-100 border-sky-300' : 'bg-white border-neutral-light hover:border-primary'}
        ${className}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-base font-poppins">{team.name}</h4>
        <div className="flex items-center gap-2">
          {showScore ? (
            <h4 className="font-bold text-base font-poppins">{team.score || 0}</h4>
          ) : (
            <Badge variant="info" size="sm">
              {players.length} {players.length === 1 ? 'player' : 'players'}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-neutral-dark">
          {players.length === 0 ? (
            <p className="italic">No players yet</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {players.map(player => (
                <span 
                  key={player.id}
                  className={`
                    inline-block px-2 py-1 rounded-full text-xs
                    ${activeSpeaker?.id === player.id 
                      ? 'bg-sky-200 text-sky-800' 
                      : 'bg-neutral-light text-neutral-dark'
                    }
                  `}
                >
                  {player.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {onPlayerJoin && (
          <Button
            variant="secondary"
            onClick={() => onPlayerJoin(team.id)}
            isLoading={isLoading}
            fullWidth
          >
            Join Team
          </Button>
        )}
      </div>
    </div>
  );
} 