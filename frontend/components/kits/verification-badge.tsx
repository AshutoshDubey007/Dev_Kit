import React from 'react';
import { VerificationReport } from '../../types/kit';
import { formatDate } from '../../lib/utils';

interface VerificationBadgeProps {
  verification: VerificationReport;
  detailed?: boolean;
  className?: string;
}

export function VerificationBadge({
  verification,
  detailed = false,
  className = '',
}: VerificationBadgeProps) {
  if (!detailed) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-mono text-emerald-300 shadow-sm transition-colors hover:border-emerald-500/40 ${className}`}
        title={`Verified on Next.js ${verification.nextjsVersion} with ${verification.testSuitePassRate}% pass rate`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-semibold text-emerald-400">VERIFIED</span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-300">Next.js {verification.nextjsVersion}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/20 to-zinc-950/60 p-5 text-xs text-zinc-300 shadow-lg backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-emerald-900/50 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
            ✓
          </span>
          <div>
            <span className="font-semibold text-emerald-300 block text-xs">
              Automated Clean-Install Audit Passed
            </span>
            <span className="text-[10px] text-zinc-400">
              Zero peer-dependency warnings • Tested in isolated Linux container
            </span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
          Audited: {formatDate(verification.verifiedDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px] mb-4">
        <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-white/[0.06]">
          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Runtime</span>
          <span className="font-semibold text-zinc-200">{verification.nextjsVersion}</span>
        </div>
        <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-white/[0.06]">
          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Pass Rate</span>
          <span className="font-semibold text-emerald-400">{verification.testSuitePassRate}%</span>
        </div>
        <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-white/[0.06]">
          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Automated Tests</span>
          <span className="font-semibold text-zinc-200">{verification.automatedTestsCount} tests</span>
        </div>
        <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-white/[0.06]">
          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Clean Install</span>
          <span className="font-semibold text-emerald-400">
            {verification.cleanInstallVerified ? '100% Clean' : 'Manual'}
          </span>
        </div>
      </div>

      <p className="text-zinc-400 leading-relaxed text-xs bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80">
        💡 {verification.auditSummary}
      </p>

      {verification.knownLimitations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80">
          <span className="block font-semibold text-amber-300/90 mb-1.5 text-xs">
            ⚠️ Disclosed Known Limitations & Requirements:
          </span>
          <ul className="list-disc list-inside text-zinc-400 space-y-1 text-xs">
            {verification.knownLimitations.map((limit, idx) => (
              <li key={idx}>{limit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
