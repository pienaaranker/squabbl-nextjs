import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export default function Input({
  label,
  helperText,
  error,
  icon,
  fullWidth = false,
  className = '',
  ...props
}: InputProps) {
  const baseStyles = 'rounded-xl border-2 border-sky-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent transition-all duration-200';
  
  const errorStyles = error ? 'border-coral-500 focus:ring-coral-300' : '';
  const widthStyles = fullWidth ? 'w-full' : '';
  const iconStyles = icon ? 'pl-10' : '';
  
  // Merge all styles
  const inputStyles = twMerge(
    baseStyles,
    errorStyles,
    widthStyles,
    iconStyles,
    className
  );
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label className="block text-slate-700 font-medium mb-2 font-nunito">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input className={inputStyles} {...props} />
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-600">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-coral-500">{error}</p>
      )}
    </div>
  );
} 