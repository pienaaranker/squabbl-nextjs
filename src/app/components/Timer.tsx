import React, { useEffect, useState } from 'react';

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
  
  // Setup SVG properties
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke-dashoffset based on remaining time
  const progressRatio = seconds / totalSeconds;
  const dashOffset = circumference * (1 - progressRatio);
  
  // State to hold and animate the offset
  const [offset, setOffset] = useState(0);
  
  // Log values for debugging
  console.log('Timer values:', { 
    seconds, 
    totalSeconds, 
    progressRatio, 
    circumference, 
    calculatedOffset: dashOffset,
    currentOffset: offset 
  });
  
  // Update offset when seconds change
  useEffect(() => {
    setOffset(dashOffset);
  }, [seconds, dashOffset]);
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2F4F4F"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isWarning ? '#FFD166' : '#B0EACD'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        
        {/* Timer text in the center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className={`font-bold text-3xl ${
              isWarning ? 'text-sunny-900' : 'text-slate-800'
            }`}
          >
            {seconds}
          </span>
        </div>
      </div>
    </div>
  );
} 