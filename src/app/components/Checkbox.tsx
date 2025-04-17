import { motion } from 'framer-motion';
import { springs } from '@/lib/animations';
import { forwardRef, InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const checkmarkVariants = {
  unchecked: { 
    pathLength: 0,
    opacity: 0
  },
  checked: { 
    pathLength: 1,
    opacity: 1,
    transition: {
      ...springs.bouncy,
      duration: 0.3
    }
  }
};

const boxVariants = {
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
    backgroundColor: "var(--primary)",
    borderColor: "var(--primary)"
  }
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
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
            type="checkbox"
            className="sr-only"
            ref={ref}
            checked={checked}
            {...props}
          />
          <motion.div
            className={`
              w-5 h-5
              rounded
              border-2
              cursor-pointer
              flex items-center justify-center
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            variants={boxVariants}
            initial="idle"
            whileHover="hover"
            animate={checked ? "checked" : "idle"}
          >
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <motion.path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={checkmarkVariants}
                initial="unchecked"
                animate={checked ? "checked" : "unchecked"}
              />
            </motion.svg>
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

Checkbox.displayName = 'Checkbox';

export default Checkbox; 