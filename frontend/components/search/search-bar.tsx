'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onOpenModal?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onOpenModal,
  placeholder = 'Search verified kits (e.g. Razorpay, Auth, RAG, Next.js 15)...',
  className = '',
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(value);

  // Sync internal state with external value changes
  useEffect(() => {
    setLocalQuery(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setLocalQuery(nextVal);
    onChange(nextVal);
  };

  const handleClear = () => {
    setLocalQuery('');
    onChange('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Input
        value={localQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        leftIcon={
          <svg className="h-4 w-4 text-[#b8531e]" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        }
        rightAdornment={
          <div className="flex items-center gap-1.5">
            {localQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="rounded p-1 text-[#b8531e] hover:text-zinc-950 transition-colors font-bold"
                title="Clear search"
              >
                ✕
              </button>
            ) : onOpenModal ? (
              <button
                type="button"
                onClick={onOpenModal}
                className="hidden sm:inline-flex items-center gap-0.5 keycap rounded px-1.5 py-0.5 text-[10px] font-pixel shadow-sm"
              >
                <span>⌘</span>
                <span>K</span>
              </button>
            ) : null}
          </div>
        }
        className="min-h-[2.75rem] bg-white border-2 border-[#cc6b35] text-sm focus:border-[#b8531e] focus:ring-2 focus:ring-[#cc6b35]/30 rounded-xl shadow-[3px_3px_0px_#e8c3a8] text-zinc-950 placeholder:text-zinc-500"
      />
    </div>
  );
}
