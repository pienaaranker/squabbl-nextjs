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
  onPlayerRemove?: (playerId: string) => void;
  isLoading?: boolean;
  activeSpeaker?: Player | null;
  showScore?: boolean;
  isHost?: boolean;
  gameState?: string;
}

export default function TeamCard({
  team,
  players,
  isActive = false,
  className = '',
  onPlayerJoin,
  onPlayerRemove,
  isLoading = false,
  activeSpeaker = null,
  showScore = false,
  isHost = false,
  gameState = 'lobby'
}: TeamCardProps) {
  const showRemoveButton = isHost && gameState === 'lobby';

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
                <div 
                  key={player.id}
                  className="flex items-center gap-1"
                >
                  <span 
                    className={`
                      inline-block px-2 py-1 rounded-full text-xs
                      ${activeSpeaker?.id === player.id 
                        ? 'bg-sky-200 text-sky-800' 
                        : 'bg-neutral-light text-neutral-dark'
                      }
                    `}
                  >
                    {player.name}
                    {player.isHost && (
                      <span className="ml-1" title="Host">👑</span>
                    )}
                  </span>
                  {showRemoveButton && !player.isHost && onPlayerRemove && (
                    <button
                      onClick={() => onPlayerRemove(player.id)}
                      className="p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove player"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
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