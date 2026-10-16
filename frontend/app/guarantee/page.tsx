import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function VerificationGuaranteePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 pb-20">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to DevKit Marketplace</span>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="success" size="sm">
            Zero-Risk Promise
          </Badge>
          <span className="text-xs text-zinc-500 font-mono">Last updated: October 16, 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          7-Day Product Verification &amp; Refund Policy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          We believe developers should never pay for broken templates. Every eligible paid purchase on DevKit comes with a guaranteed 7-day testing and verification window.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
        {/* Core Timeline Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">How the 7-Day Window Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1.5">
              <span className="text-emerald-400 font-mono font-bold text-xs">Step 1: Unpack &amp; Test</span>
              <p className="text-zinc-400 text-xs">
                Install dependencies and run the included automated test suite in your environment according to the author setup guide.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1.5">
              <span className="text-emerald-400 font-mono font-bold text-xs">Step 2: Confirm or Report</span>
              <p className="text-zinc-400 text-xs">
                If the code works, click &quot;Product Works&quot; in your dashboard. If you encounter an unexpected bug, click &quot;Report an Issue&quot;.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/40 space-y-1.5">
              <span className="text-emerald-400 font-mono font-bold text-xs">Step 3: Remediation or Refund</span>
              <p className="text-zinc-400 text-xs">
                The author has 48 hours to provide a fix in chat. If the issue cannot be resolved, you receive a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Eligible Refund Criteria */}
        <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Eligible Refund Scenarios</span>
          </h2>
          <p className="text-zinc-400">
            You are fully eligible for a 100% refund during your 7-day verification window if:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>
              <strong>Clean Install Failure:</strong> The product fails to install or compile on the documented runtime/framework versions when following the author&apos;s setup steps.
            </li>
            <li>
              <strong>Critical Defect:</strong> Key advertised features (e.g. webhook verification, OAuth handshake, streaming API) fail to work as described in the product specification.
            </li>
            <li>
              <strong>Undisclosed Limitation:</strong> A severe operational constraint was omitted from the product listing&apos;s &quot;Known Limitations&quot; section.
            </li>
            <li>
              <strong>Author Unresponsive:</strong> You filed a ticket during your 7-day window and the author failed to respond within 48 hours.
            </li>
          </ul>
        </section>

        {/* Section: Ineligible Scenarios */}
        <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/70 p-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Ineligible Refund Scenarios</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>
              <strong>Buyer Remorse:</strong> Changing your mind after downloading the source code without identifying a software defect.
            </li>
            <li>
              <strong>Disclosed Limitations:</strong> Issues explicitly noted in the &quot;Known Limitations&quot; box on the marketplace listing prior to purchase.
            </li>
            <li>
              <strong>Custom Feature Requests:</strong> Demanding modifications, new integrations, or phone consultation outside the published product scope.
            </li>
            <li>
              <strong>Post-Window Expiration:</strong> Requesting refunds after the 7-day verification deadline has expired without an open ticket.
            </li>
          </ul>
        </section>

        {/* Action Link */}
        <div className="text-center pt-4">
          <Link href="/buyer/verifications">
            <Button variant="primary" size="lg" className="text-xs font-semibold">
              <span>Go to Your Product Verification Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
