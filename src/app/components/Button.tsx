import { motion, HTMLMotionProps } from 'framer-motion';
import { buttonVariants, springs } from '@/lib/animations';
import { ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'bg-mint-500 hover:bg-mint-600 text-slate-800 focus:ring-mint-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300',
  warning: 'bg-sunny-500 hover:bg-sunny-600 text-slate-800 focus:ring-sunny-300',
  accent: 'btn-accent'
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
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
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
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" color="white" />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
} 