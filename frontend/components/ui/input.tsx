'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', leftIcon, rightAdornment, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-sm transition-colors',
            'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon ? 'pl-10' : '',
            rightAdornment ? 'pr-12' : '',
            className
          )}
          {...props}
        />
        {rightAdornment && (
          <div className="absolute right-3 flex items-center">
            {rightAdornment}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
