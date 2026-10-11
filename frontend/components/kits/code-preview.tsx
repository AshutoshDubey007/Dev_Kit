'use client';

import React, { useState } from 'react';
import { CodeSnippet } from '../../types/kit';

interface CodePreviewProps {
  snippets: CodeSnippet[];
  className?: string;
}

export function CodePreview({ snippets, className = '' }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!snippets || snippets.length === 0) return null;

  const currentSnippet = snippets[activeTab] || snippets[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border border-white/[0.09] bg-[#0c0d11] overflow-hidden shadow-2xl font-mono text-xs ${className}`}
    >
      {/* Authentic Terminal Window Chrome */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#121318] px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 border border-red-600/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 border border-amber-600/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 border border-emerald-600/60" />
          </div>

          {/* File Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {snippets.map((snippet, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={snippet.filename}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 text-indigo-300 font-semibold border border-indigo-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <span className="text-zinc-500 text-[10px]">📄</span>
                  <span>{snippet.filename}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-zinc-800/70 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all shadow-inner"
          title="Copy snippet"
        >
          {copied ? (
            <>
              <span className="text-emerald-400 text-xs">✓</span>
              <span className="text-emerald-300 font-sans font-medium">Copied!</span>
            </>
          ) : (
            <>
              <span className="text-zinc-400 text-xs">📋</span>
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Snippet Explanation Banner */}
      {currentSnippet.description && (
        <div className="border-b border-white/[0.06] bg-indigo-950/20 px-4 py-1.5 text-[11px] text-indigo-200/80 font-sans flex items-center gap-2">
          <span className="text-indigo-400">⚡</span>
          <span>{currentSnippet.description}</span>
        </div>
      )}

      {/* Code Area with Syntax Highlighting Look */}
      <div className="overflow-x-auto p-4 text-zinc-300 bg-[#090a0d] leading-relaxed font-mono">
        <pre className="text-xs">
          <code>
            {currentSnippet.code.split('\n').map((line, i) => (
              <div key={i} className="table-row group">
                <span className="table-cell pr-5 select-none text-right text-zinc-600 text-[11px] group-hover:text-zinc-400">
                  {i + 1}
                </span>
                <span className="table-cell whitespace-pre text-zinc-200">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
