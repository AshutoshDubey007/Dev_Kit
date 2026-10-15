import React from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';

export default function VerificationStandardsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-3.5 py-1 text-xs text-emerald-400 font-mono">
          <span>●</span>
          <span>The DevKit Trust Standard</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Every kit is tested before you buy it.
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The marketplace is flooded with abandoned templates that fail on `npm install`. We hold every integration kit to strict verification criteria.
        </p>

        <div className="pt-2">
          <Link href="/buyer/verifications">
            <Button variant="outline" size="sm" className="text-xs border-emerald-700/60 text-emerald-300 hover:bg-emerald-950/40">
              🛡️ Go to Your Product Verification Dashboard →
            </Button>
          </Link>
        </div>
      </div>

      {/* The 6 Core Audit Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
          <span className="text-2xl">1️⃣</span>
          <h3 className="text-base font-bold text-zinc-100">Clean Install Guarantee</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Every kit is tested in a clean virtual container starting with zero cached node_modules. If a dependency warning or build script fails, the kit is rejected.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
          <span className="text-2xl">2️⃣</span>
          <h3 className="text-base font-bold text-zinc-100">100% Automated Test Suites</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Kits must include automated unit and integration tests covering unhappy paths: webhook replay attacks, signature mismatches, token expiration, and database rollbacks.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
          <span className="text-2xl">3️⃣</span>
          <h3 className="text-base font-bold text-zinc-100">Next.js 15 & React 19 Verified</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We explicitly state the exact framework and Node.js version tested (e.g. Next.js 15.1.0 on Node v20 LTS). No legacy Pages Router hacks masquerading as modern code.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
          <span className="text-2xl">4️⃣</span>
          <h3 className="text-base font-bold text-zinc-100">Disclosed Known Limitations</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No software is magic. We mandate an honest "Known Limitations" section on every product page so buyers know upfront if international cards or local tunnels are required.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
          <span className="text-2xl">5️⃣</span>
          <h3 className="text-base font-bold text-zinc-100">5-Minute Setup Documentation</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Every kit contains a verified `README.md` with step-by-step setup guides, `.env.example` keys, and zero unstated environment assumptions.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 space-y-2">
          <span className="text-2xl">6️⃣</span>
          <h3 className="text-base font-bold text-zinc-100">Commercial Freedom</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            You get 100% source code ownership with an unrestricted commercial license. Use the code for your own SaaS, internal agency tools, or client deliverables with zero royalties.
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950 text-center space-y-4">
        <h3 className="text-xl font-bold text-zinc-100">Ready to build without the boilerplate headache?</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Browse our verified catalogue of Next.js integration kits and ship your next project faster.
        </p>
        <div className="pt-2">
          <Link href="/kits">
            <Button variant="primary" size="md">
              Explore Verified Kits →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
