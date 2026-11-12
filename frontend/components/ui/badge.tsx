import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'outline' | 'purple' | 'secondary' | 'warning';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-pixel font-bold uppercase tracking-wide rounded-md select-none';

  const variants = {
    default: 'bg-[#f7ece1] text-[#964115] border-2 border-[#cc6b35]',
    secondary: 'bg-white text-zinc-800 border-2 border-orange-300',
    success: 'bg-[#b8531e] text-white border-2 border-[#78330f]',
    warning: 'bg-amber-100 text-amber-950 border-2 border-amber-600',
    purple: 'bg-[#f5e3d3] text-[#964115] border-2 border-[#b8531e]',
    outline: 'border-2 border-[#cc6b35] text-[#b8531e] bg-white',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
