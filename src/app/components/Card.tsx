import { forwardRef, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'accent';
  interactive?: boolean;
  title?: string;
  headerClassName?: string;
  subtitle?: string;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  title,
  headerClassName = '',
  subtitle,
  ...props
}, ref) => {
  const baseStyles = 'card rounded-xl transition-shadow';
  
  const variantStyles = {
    default: 'bg-white border border-neutral-light',
    elevated: 'bg-white shadow-lg',
    outlined: 'border-2 border-neutral-light bg-transparent',
    accent: 'card-accent'
  };

  const interactiveStyles = interactive ? 'cursor-pointer hover:-translate-y-1 active:translate-y-0 transition-transform' : '';

  return (
    <div
      ref={ref}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${interactiveStyles}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`mb-4 ${headerClassName}`}>
          {title && <h3 className="text-xl font-bold font-poppins text-slate-800">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Container component for card grids
export const CardGrid = ({
  children,
  className = '',
  columns = 3,
}: {
  children: ReactNode;
  className?: string;
  columns?: number;
}) => {
  return (
    <div 
      className={`
        grid gap-6
        grid-cols-1
        sm:grid-cols-2
        ${columns >= 3 ? 'lg:grid-cols-3' : ''}
        ${columns >= 4 ? 'xl:grid-cols-4' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;