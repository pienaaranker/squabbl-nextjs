import { motion } from 'framer-motion';
import { springs } from '@/lib/animations';
import { ReactNode } from 'react';
import { gapSizes, gridColumns } from './constants';

interface GridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

interface FlexRowProps {
  children: ReactNode;
  className?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

const alignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyContent = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.subtle,
  },
};

export function Grid({
  children,
  className = '',
  columns = 1,
  gap = 'md',
  animate = false,
}: GridProps) {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    variants: containerVariants,
    initial: "hidden",
    animate: "visible",
  } : {};

  return (
    <Component
      className={`
        grid
        ${gridColumns[columns]}
        ${gapSizes[gap]}
        ${className}
      `}
      {...animationProps}
    >
      {animate
        ? Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div key={i} variants={itemVariants}>
                {child}
              </motion.div>
            ))
          : <motion.div variants={itemVariants}>{children}</motion.div>
        : children}
    </Component>
  );
}

export function FlexRow({
  children,
  className = '',
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
}: FlexRowProps) {
  return (
    <div
      className={`
        flex
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${alignments[align]}
        ${justifyContent[justify]}
        ${gapSizes[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function AutoGrid({
  children,
  className = '',
  gap = 'md',
  minWidth = '250px',
}: {
  children: ReactNode;
  className?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minWidth?: string;
}) {
  return (
    <div
      className={`
        grid
        ${gapSizes[gap]}
        ${className}
      `}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

export function SplitSection({
  left,
  right,
  className = '',
  reverse = false,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-8
        ${className}
      `}
    >
      <div className={reverse ? 'lg:order-last' : ''}>
        {left}
      </div>
      <div className={reverse ? 'lg:order-first' : ''}>
        {right}
      </div>
    </div>
  );
} 