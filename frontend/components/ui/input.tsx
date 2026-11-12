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
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#b8531e]">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex min-h-[2.5rem] w-full rounded-lg border-2 border-orange-300 bg-white px-3.5 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 shadow-[2px_2px_0px_#e8c3a8] transition-colors',
            'focus:outline-none focus:border-[#b8531e] focus:ring-2 focus:ring-[#cc6b35]/30',
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
