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
      className={`rounded-xl border-2 border-[#cc6b35] bg-white overflow-hidden shadow-[5px_5px_0px_#cc6b35] font-mono text-xs ${className}`}
    >
      {/* Arcade Code Window Chrome */}
      <div className="flex items-center justify-between border-b-2 border-[#cc6b35] bg-[#f7ece1] px-4 py-2.5 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Arcade Dots */}
          <div className="flex items-center gap-1.5 mr-2 shrink-0">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#b8531e]" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#cc6b35]" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#e5a982]" />
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
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-pixel transition-all ${
                    isActive
                      ? 'bg-[#b8531e] text-white font-bold border border-[#78330f]'
                      : 'text-zinc-700 hover:text-[#b8531e] hover:bg-orange-100'
                  }`}
                >
                  <span className="text-[10px]">📄</span>
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
          className="flex items-center gap-1.5 rounded-md border-2 border-[#cc6b35] bg-white px-2.5 py-1 text-[11px] font-pixel text-[#b8531e] hover:bg-orange-50 transition-all shrink-0 font-bold"
          title="Copy snippet"
        >
          {copied ? (
            <>
              <span className="text-[#b8531e] text-xs">✓</span>
              <span className="text-[#b8531e]">Copied!</span>
            </>
          ) : (
            <>
              <span className="text-xs">📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Snippet Explanation Banner */}
      {currentSnippet.description && (
        <div className="border-b border-orange-200 bg-[#fcfaf7] px-4 py-1.5 text-[11px] text-[#964115] font-sans flex items-center gap-2 font-medium">
          <span className="text-[#cc6b35]">⚡</span>
          <span>{currentSnippet.description}</span>
        </div>
      )}

      {/* Code Area */}
      <div className="overflow-x-auto p-4 text-zinc-900 bg-white leading-relaxed font-mono">
        <pre className="text-xs">
          <code>
            {currentSnippet.code.split('\n').map((line, i) => (
              <div key={i} className="table-row group">
                <span className="table-cell pr-5 select-none text-right text-orange-400 text-[11px] group-hover:text-[#b8531e]">
                  {i + 1}
                </span>
                <span className="table-cell whitespace-pre text-zinc-900">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
