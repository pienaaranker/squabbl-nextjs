import { motion } from 'framer-motion';
import { springs } from '@/lib/animations';
import { forwardRef, InputHTMLAttributes } from 'react';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const circleVariants = {
  unchecked: { 
    scale: 0,
    opacity: 0
  },
  checked: { 
    scale: 1,
    opacity: 1,
    transition: {
      ...springs.bouncy,
      duration: 0.3
    }
  }
};

const radioVariants = {
  idle: { 
    scale: 1,
    borderColor: "var(--neutral-light)"
  },
  hover: { 
    scale: 1.05,
    borderColor: "var(--primary)",
    transition: springs.subtle
  },
  checked: {
    scale: 1,
    borderColor: "var(--primary)"
  }
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  error,
  className = '',
  containerClassName = '',
  checked,
  ...props
}, ref) => {
  return (
    <div className={`relative flex items-start ${containerClassName}`}>
      <div className="flex items-center h-5">
        <div className="relative">
          <input
            type="radio"
            className="sr-only"
            ref={ref}
            checked={checked}
            {...props}
          />
          <motion.div
            className={`
              w-5 h-5
              rounded-full
              border-2
              cursor-pointer
              flex items-center justify-center
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            variants={radioVariants}
            initial="idle"
            whileHover="hover"
            animate={checked ? "checked" : "idle"}
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-primary"
              variants={circleVariants}
              initial="unchecked"
              animate={checked ? "checked" : "unchecked"}
            />
          </motion.div>
        </div>
      </div>
      
      {label && (
        <div className="ml-3">
          <label className={`text-sm ${error ? 'text-red-500' : 'text-foreground'}`}>
            {label}
          </label>
          {error && (
            <motion.p
              className="text-xs text-red-500 mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export default Radio; 