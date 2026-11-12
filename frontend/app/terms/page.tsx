import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Scale, ArrowLeft } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 pb-20">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-950 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to DevKit Marketplace</span>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm">
            Legal &amp; Licensing
          </Badge>
          <span className="text-xs text-zinc-600 font-mono">Last updated: October 16, 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
          Terms of Service &amp; Commercial License
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
          DevKit Marketplace operates as a curated code distribution platform connecting independent software developers and digital agencies with verified Next.js and TypeScript integration kits.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-800 leading-relaxed font-light">
        {/* Section 1 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#b8531e]" />
            <span>1. Commercial Developer License Grant</span>
          </h2>
          <p>
            When you purchase a code kit, starter template, or prompt architecture on DevKit, the author grants you a perpetual, worldwide, non-exclusive, non-transferable license to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600">
            <li>Incorporate the code into unlimited commercial and personal applications.</li>
            <li>Modify, adapt, and build upon the source code without attribution.</li>
            <li>Deploy closed-source software, client deliverables, and SaaS products incorporating the code.</li>
          </ul>
          <div className="p-3 rounded-xl bg-[#f7ece1] border border-[#cc6b35] text-[#b8531e] text-xs mt-3">
            <strong>License Restriction:</strong> You may NOT redistribute, resell, relicense, or make publicly available the raw, unmodified or minimally modified source code package as a competing code template or digital marketplace asset.
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#b8531e]" />
            <span>2. Author Warranties &amp; Code Authenticity</span>
          </h2>
          <p>
            Every seller listing products on DevKit warrants that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600">
            <li>They own all copyrights or possess explicit licensing rights to distribute the provided code.</li>
            <li>The code package contains zero malicious payloads, backdoors, undisclosed telemetry, or obfuscated binaries.</li>
            <li>Open-source dependencies are legally compatible with commercial proprietary use (e.g., MIT, Apache-2.0, BSD).</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#b8531e]" />
            <span>3. 7-Day Product Verification Window</span>
          </h2>
          <p>
            All paid purchases come with an automated seven-day product verification window beginning at the server-confirmed purchase timestamp. During this period:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600">
            <li>Buyers are entitled to test the code in a clean environment as specified in the author setup guide.</li>
            <li>Buyers have direct access to the author via DevKit In-App Chat for setup assistance.</li>
            <li>If an unresolvable bug or failure occurs, buyers may file an issue ticket for author remediation or platform refund.</li>
          </ul>
          <p className="pt-2 text-zinc-600">
            For full refund details and dispute procedures, see our{' '}
            <Link href="/guarantee" className="text-[#b8531e] hover:underline">
              7-Day Product Verification &amp; Refund Policy
            </Link>
            .
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <Scale className="h-4 w-4 text-zinc-600" />
            <span>4. Limitation of Liability</span>
          </h2>
          <p className="text-zinc-600">
            DevKit provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis. In no event shall DevKit, its creators, or authors be liable for indirect, incidental, special, consequential, or punitive damages arising from the implementation or failure of third-party software beyond the purchase price paid for the specific asset.
          </p>
        </section>
      </div>
    </div>
  );
}
