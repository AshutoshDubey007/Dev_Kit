'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Kit } from '../../types/kit';
import { formatPriceINR } from '../../lib/utils';
import { Badge } from '../ui/badge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  kits: Kit[];
}

export function SearchModal({ isOpen, onClose, kits }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey listener: Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger handled by parent if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter matching kits
  const filteredKits = query.trim()
    ? kits.filter((kit) => {
        const fullText = [kit.title, kit.tagline, ...kit.techStack].join(' ').toLowerCase();
        return fullText.includes(query.toLowerCase());
      })
    : kits.slice(0, 5);

  const handleSelect = (slug: string) => {
    onClose();
    router.push(`/kits/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredKits.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredKits.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && filteredKits[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredKits[selectedIndex].slug);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl rounded-2xl border-2 border-[#cc6b35] bg-white p-2 shadow-[6px_6px_0px_#cc6b35] overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b-2 border-orange-100 px-4 py-3">
          <span className="text-[#b8531e] text-sm">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type an integration name, feature, or tech stack..."
            className="w-full bg-transparent text-sm text-zinc-950 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="keycap rounded px-1.5 py-0.5 text-[10px] font-pixel">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredKits.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-600 font-pixel">
              No verified kits found for "{query}"
            </div>
          ) : (
            filteredKits.map((kit, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={kit.id}
                  onClick={() => handleSelect(kit.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#f7ece1] border-2 border-[#cc6b35] text-zinc-950'
                      : 'hover:bg-orange-50 text-zinc-800 border-2 border-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-pixel font-bold text-zinc-950">
                        {kit.title}
                      </span>
                      <Badge variant="success" size="sm" className="text-[10px]">
                        Tested
                      </Badge>
                    </div>
                    <span className="text-xs text-zinc-600 line-clamp-1">
                      {kit.tagline}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-pixel font-bold text-[#b8531e]">
                      {formatPriceINR(kit.priceINR)}
                    </span>
                    <span className="text-[#cc6b35] text-xs font-bold">↵</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Hotkeys */}
        <div className="flex items-center justify-between border-t-2 border-orange-100 bg-[#faf5ef] px-4 py-2 text-[11px] text-[#964115] font-pixel">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>↵ Select</span>
          </div>
          <span>DevKit Verified Search</span>
        </div>
      </div>
    </div>
  );
}
