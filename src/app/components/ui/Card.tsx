import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'highlight';
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  title,
  subtitle,
  icon
}: CardProps) {
  const baseStyles = 'card';
  
  const variantStyles = {
    default: '',
    accent: 'card-accent',
    highlight: 'card-highlight'
  };
  
  // Merge all styles
  const cardStyles = twMerge(
    baseStyles,
    variantStyles[variant],
    className
  );
  
  return (
    <div className={cardStyles}>
      {(title || icon) && (
        <div className="flex items-center mb-4">
          {icon && <div className="mr-3">{icon}</div>}
          <div>
            {title && <h3 className="text-xl font-bold font-poppins text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
} 