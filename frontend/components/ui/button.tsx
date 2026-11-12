'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-pixel font-bold tracking-wide rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cc6b35] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 select-none active:translate-x-[1px] active:translate-y-[1px]';

    const variants = {
      primary:
        'bg-[#b8531e] text-white border-2 border-[#78330f] shadow-[3px_3px_0px_#e5a982] hover:bg-[#964115] active:shadow-none',
      secondary:
        'bg-[#f7ece1] text-[#964115] border-2 border-[#cc6b35] shadow-[3px_3px_0px_#cc6b35] hover:bg-[#f5e3d3] active:shadow-none',
      outline:
        'border-2 border-[#cc6b35] bg-white text-[#b8531e] hover:bg-[#faf5ef] hover:text-[#964115] shadow-[2px_2px_0px_#e8c3a8] active:shadow-none',
      ghost:
        'bg-transparent text-zinc-700 hover:bg-orange-100 hover:text-[#b8531e] border-2 border-transparent',
      danger:
        'bg-red-700 text-white border-2 border-red-950 shadow-[3px_3px_0px_#fca5a5] hover:bg-red-800 active:shadow-none',
      white:
        'bg-white text-[#b8531e] border-2 border-[#b8531e] hover:bg-[#faf5ef] font-bold shadow-[3px_3px_0px_#cc6b35] active:shadow-none',
      glass:
        'bg-white/95 hover:bg-[#faf5ef] border-2 border-[#cc6b35] text-[#964115] backdrop-blur-md shadow-[3px_3px_0px_#cc6b35] active:shadow-none',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[2rem]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[2.5rem]',
      lg: 'text-sm px-6 py-3 gap-2.5 min-h-[3rem]',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
