import React from 'react';
import LoadingSpinner from './LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-coral-500 hover:bg-coral-600 text-white focus:ring-coral-300',
  secondary: 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-300',
  success: 'bg-mint-500 hover:bg-mint-600 text-slate-800 focus:ring-mint-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300',
  warning: 'bg-sunny-500 hover:bg-sunny-600 text-slate-800 focus:ring-sunny-300',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`
        ${variantClass}
        ${sizeClass}
        ${widthClass}
        font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all transform hover:translate-y-[-1px]
        flex items-center justify-center
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" color="white" />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
} 