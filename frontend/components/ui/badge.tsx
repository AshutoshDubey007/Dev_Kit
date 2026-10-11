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
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    default: 'bg-zinc-800 text-zinc-200 border border-zinc-700',
    secondary: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
    success: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-800/80',
    purple: 'bg-purple-950/80 text-purple-300 border border-purple-800/80',
    outline: 'border border-zinc-700 text-zinc-300 bg-transparent',
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
