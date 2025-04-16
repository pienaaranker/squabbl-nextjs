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
}

export default function TeamCard({
  team,
  players,
  isActive = false,
  className = '',
  onPlayerJoin,
  isLoading = false
}: TeamCardProps) {
  return (
    <motion.div 
      className={`
        p-4 rounded-lg border-2
        ${isActive ? 'bg-sky-100 border-sky-300' : 'bg-white border-neutral-light hover:border-primary'}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      transition={springs.subtle}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg font-poppins">{team.name}</h3>
          <Badge variant="info" size="sm">
            {players.length} {players.length === 1 ? 'player' : 'players'}
          </Badge>
        </div>
        {team.score !== undefined && (
          <span className="text-2xl font-bold text-primary">{team.score}</span>
        )}
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
                  className="inline-block bg-neutral-light px-2 py-1 rounded-full text-xs"
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
    </motion.div>
  );
} 