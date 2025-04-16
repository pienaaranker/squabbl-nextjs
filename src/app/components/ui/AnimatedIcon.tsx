import React from 'react';
import { twMerge } from 'tailwind-merge';

type AnimationType = 'bounce' | 'pulse' | 'wiggle' | 'none';
type IconColor = 'coral' | 'mint' | 'sunny' | 'sky';

interface AnimatedIconProps {
  icon: React.ReactNode;
  animation?: AnimationType;
  color?: IconColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function AnimatedIcon({
  icon,
  animation = 'none',
  color = 'coral',
  size = 'md',
  className = '',
}: AnimatedIconProps) {
  const colorMap = {
    coral: 'bg-coral-500',
    mint: 'bg-mint-500',
    sunny: 'bg-sunny-500',
    sky: 'bg-sky-500',
  };

  const sizeMap = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  };

  const animationMap = {
    bounce: 'animate-bounce-subtle',
    pulse: 'animate-pulse-subtle',
    wiggle: 'animate-wiggle',
    none: '',
  };

  const classes = twMerge(
    'rounded-full flex items-center justify-center',
    colorMap[color],
    sizeMap[size],
    animationMap[animation],
    className
  );

  return (
    <div className={classes}>
      {icon}
    </div>
  );
} 