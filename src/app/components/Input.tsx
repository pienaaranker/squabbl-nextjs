import { motion, HTMLMotionProps } from 'framer-motion';
import { inputVariants, springs } from '@/lib/animations';
import { forwardRef, ReactNode } from 'react';

interface InputProps extends Omit<HTMLMotionProps<"input">, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`relative space-y-2 ${containerClassName}`}>
      {label && (
        <motion.label 
          className="block text-sm font-medium text-foreground"
          initial={{ y: 0 }}
          animate={{ y: error ? -2 : 0 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark">
            {leftIcon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          className={`
            w-full
            bg-white
            rounded-lg
            border-2
            px-4 py-2.5
            text-foreground
            placeholder:text-neutral-dark
            transition-shadow
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
            ${className}
          `}
          variants={inputVariants}
          initial="idle"
          whileFocus="focus"
          animate={error ? { 
            x: [-4, 4, -2, 2, 0],
            transition: springs.snappy 
          } : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark">
            {rightIcon}
          </div>
        )}
      </div>

      {(error || hint) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`text-sm ${error ? 'text-red-500' : 'text-neutral-dark'}`}
        >
          {error || hint}
        </motion.div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 