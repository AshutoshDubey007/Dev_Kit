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
        className={`inline-flex items-center gap-2 rounded-md border-2 border-[#cc6b35] bg-[#faf5ef] px-2.5 py-1 text-[11px] font-pixel text-[#964115] shadow-sm transition-colors hover:border-[#b8531e] ${className}`}
        title={`Verified on Next.js ${verification.nextjsVersion} with ${verification.testSuitePassRate}% pass rate`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cc6b35] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b8531e]" />
        </span>
        <span className="font-bold text-[#b8531e]">VERIFIED</span>
        <span className="text-orange-400">|</span>
        <span className="text-zinc-900">Next.js {verification.nextjsVersion}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border-2 border-[#cc6b35] bg-white p-5 text-xs text-zinc-800 shadow-[4px_4px_0px_#cc6b35] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-orange-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#b8531e] text-white font-pixel text-xs font-bold">
            ✓
          </span>
          <div>
            <span className="font-pixel font-bold text-zinc-950 block text-xs">
              Automated Clean-Install Audit Passed
            </span>
            <span className="text-[11px] text-zinc-600">
              Zero peer-dependency warnings • Tested in isolated Linux container
            </span>
          </div>
        </div>
        <span className="text-[11px] text-[#964115] font-pixel font-bold bg-[#f7ece1] px-2.5 py-0.5 rounded border border-orange-300">
          Audited: {formatDate(verification.verifiedDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-pixel text-[11px] mb-4">
        <div className="bg-[#faf5ef] p-2.5 rounded-lg border border-orange-200">
          <span className="block text-[10px] text-zinc-600 uppercase tracking-wider">Runtime</span>
          <span className="font-bold text-zinc-950">{verification.nextjsVersion}</span>
        </div>
        <div className="bg-[#faf5ef] p-2.5 rounded-lg border border-orange-200">
          <span className="block text-[10px] text-zinc-600 uppercase tracking-wider">Pass Rate</span>
          <span className="font-bold text-[#b8531e]">{verification.testSuitePassRate}%</span>
        </div>
        <div className="bg-[#faf5ef] p-2.5 rounded-lg border border-orange-200">
          <span className="block text-[10px] text-zinc-600 uppercase tracking-wider">Automated Tests</span>
          <span className="font-bold text-zinc-950">{verification.automatedTestsCount} tests</span>
        </div>
        <div className="bg-[#faf5ef] p-2.5 rounded-lg border border-orange-200">
          <span className="block text-[10px] text-zinc-600 uppercase tracking-wider">Clean Install</span>
          <span className="font-bold text-[#b8531e]">
            {verification.cleanInstallVerified ? '100% Clean' : 'Manual'}
          </span>
        </div>
      </div>

      <p className="text-zinc-700 leading-relaxed text-xs bg-[#fcfaf7] p-3 rounded-lg border border-orange-200">
        💡 {verification.auditSummary}
      </p>

      {verification.knownLimitations.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-orange-100">
          <span className="block font-pixel font-bold text-[#964115] mb-1.5 text-xs">
            ⚠️ Disclosed Known Limitations &amp; Requirements:
          </span>
          <ul className="list-disc list-inside text-zinc-700 space-y-1 text-xs">
            {verification.knownLimitations.map((limit, idx) => (
              <li key={idx}>{limit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
