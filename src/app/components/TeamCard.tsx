import React from 'react';
import type { Team, Player } from '@/types/firestore';

interface TeamCardProps {
  team: Team;
  players: Player[];
  isActive?: boolean;
  className?: string;
}

export default function TeamCard({
  team,
  players,
  isActive = false,
  className = ''
}: TeamCardProps) {
  const teamMembers = players.filter(p => p.teamId === team.id);

  return (
    <div 
      className={`
        p-3 rounded-md 
        ${isActive ? 'bg-sky-100 border-2 border-sky-300' : 'bg-slate-50'}
        ${className}
      `}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-slate-800">{team.name}</span>
        <span className="font-bold text-xl text-slate-800">{team.score}</span>
      </div>
      
      <div className="mt-2 text-sm text-slate-600">
        Players: {teamMembers.map(p => p.name).join(', ')}
      </div>
    </div>
  );
} 