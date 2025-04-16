import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  icon,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  hover = false,
  onClick,
}: CardProps) {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  const clickableProps = onClick ? { onClick, role: 'button', tabIndex: 0 } : {};
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-sky-100 ${hoverClass} ${className}`}
      {...clickableProps}
    >
      {(title || icon) && (
        <div className={`flex items-center p-4 border-b border-sky-100 ${headerClassName}`}>
          {icon && <div className="mr-3">{icon}</div>}
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
        </div>
      )}
      
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-sky-100 p-4 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
} 