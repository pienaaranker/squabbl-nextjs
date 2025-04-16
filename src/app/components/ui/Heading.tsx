import React from 'react';
import { twMerge } from 'tailwind-merge';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface HeadingProps {
  level?: HeadingLevel;
  size?: HeadingSize;
  children: React.ReactNode;
  className?: string;
  color?: 'default' | 'primary' | 'accent' | 'light';
  align?: 'left' | 'center' | 'right';
}

export default function Heading({
  level = 2,
  size,
  children,
  className = '',
  color = 'default',
  align = 'left',
}: HeadingProps) {
  // Map heading level to default size if size is not provided
  const defaultSizes: Record<HeadingLevel, HeadingSize> = {
    1: '3xl',
    2: '2xl',
    3: 'xl',
    4: 'lg',
    5: 'md',
    6: 'sm',
  };
  
  const headingSize = size || defaultSizes[level];
  
  const sizeStyles: Record<HeadingSize, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };
  
  const colorStyles: Record<string, string> = {
    'default': 'text-slate-800',
    'primary': 'text-coral-500',
    'accent': 'text-mint-500',
    'light': 'text-white',
  };
  
  const alignStyles: Record<string, string> = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  };
  
  const styles = twMerge(
    'font-bold font-poppins mb-4',
    sizeStyles[headingSize],
    colorStyles[color],
    alignStyles[align],
    className
  );
  
  // Render the appropriate heading based on level
  switch (level) {
    case 1:
      return <h1 className={styles}>{children}</h1>;
    case 2:
      return <h2 className={styles}>{children}</h2>;
    case 3:
      return <h3 className={styles}>{children}</h3>;
    case 4:
      return <h4 className={styles}>{children}</h4>;
    case 5:
      return <h5 className={styles}>{children}</h5>;
    case 6:
      return <h6 className={styles}>{children}</h6>;
    default:
      return <h2 className={styles}>{children}</h2>;
  }
} 