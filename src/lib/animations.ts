import { Variants } from 'framer-motion';

// Spring configurations for different types of animations
export const springs = {
  // Bouncy spring for playful interactions
  bouncy: {
    type: "spring",
    damping: 10,
    stiffness: 100,
    mass: 0.5,
  },
  // Subtle spring for micro-interactions
  subtle: {
    type: "spring",
    damping: 15,
    stiffness: 120,
  },
  // Quick spring for responsive feedback
  snappy: {
    type: "spring",
    damping: 20,
    stiffness: 300,
  }
};

// Button animation variants
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: springs.bouncy 
  },
  tap: { 
    scale: 0.95,
    transition: springs.snappy
  }
};

// Input field animation variants
export const inputVariants: Variants = {
  idle: { 
    scale: 1,
    borderColor: "var(--neutral-light)",
    boxShadow: "0 0 0 0px var(--primary)"
  },
  focus: { 
    scale: 1.02,
    borderColor: "var(--primary)",
    boxShadow: "0 0 0 2px var(--primary)",
    transition: springs.subtle
  }
};

// Card animation variants
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      ...springs.bouncy,
      duration: 0.5
    }
  },
  hover: {
    y: -5,
    transition: springs.subtle
  }
};

// List item animation variants
export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      ...springs.bouncy
    }
  }),
  exit: {
    opacity: 0,
    x: 20,
    transition: springs.snappy
  }
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ...springs.subtle
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
};

// Toast notification variants
export const toastVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 50,
    scale: 0.3 
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.bouncy
  },
  exit: { 
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 }
  }
};

// Hover scale effect with custom spring
export const scaleOnHover = {
  scale: 1,
  hover: {
    scale: 1.02,
    transition: springs.subtle
  }
}; 