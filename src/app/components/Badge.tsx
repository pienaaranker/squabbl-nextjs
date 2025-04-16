import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-800',
  primary: 'bg-coral-100 text-coral-800',
  success: 'bg-mint-100 text-mint-800',
  warning: 'bg-sunny-100 text-sunny-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className = '',
}: BadgeProps) {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const roundedClass = rounded ? 'rounded-full' : 'rounded';
  
  return (
    <span
      className={`
        ${variantClass}
        ${sizeClass}
        ${roundedClass}
        inline-flex items-center justify-center font-medium
        ${className}
      `}
    >
      {children}
    </span>
  );
} 