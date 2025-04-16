import React from 'react';

interface TimerProps {
  seconds: number;
  totalSeconds: number;
  className?: string;
  warningThreshold?: number;
}

export default function Timer({
  seconds,
  totalSeconds,
  className = '',
  warningThreshold = 10
}: TimerProps) {
  const isWarning = seconds <= warningThreshold;
  const progressPercentage = (seconds / totalSeconds) * 100;
  
  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`font-bold text-2xl ${isWarning ? 'text-red-600' : 'text-slate-800'}`}>
          {seconds}s
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-4">
        <div 
          className={`h-4 rounded-full ${isWarning ? 'bg-red-500' : 'bg-coral-500'}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
} 