import React from 'react';
import Link from 'next/link';
import { Lock, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 pb-20">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-950 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to DevKit Marketplace</span>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="success" size="sm">
            Privacy First
          </Badge>
          <span className="text-xs text-zinc-600 font-mono">Last updated: October 16, 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
          Privacy Policy &amp; Data Protection
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
          DevKit is built for developers. We collect only what is strictly necessary to authenticate your account, fulfill code downloads, and protect buyer-seller transactions.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-800 leading-relaxed font-light">
        {/* Section 1 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#b8531e]" />
            <span>1. What Data We Collect</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600">
            <li>
              <strong>Account Identity:</strong> Your email address and public name (via GitHub or Google OAuth) to authenticate your access and bind download tokens.
            </li>
            <li>
              <strong>Order Records:</strong> Order references, payment timestamps, and associated kit IDs to fulfill product delivery and enforce the 7-day warranty.
            </li>
            <li>
              <strong>In-App Support Chat Transcripts:</strong> Messages exchanged between buyers and sellers regarding product setup and issue resolution.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-[#b8531e]" />
            <span>2. What We NEVER Collect or Store</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600">
            <li>
              <strong>No Credit Card Numbers:</strong> All payment processing is handled through Razorpay’s PCI-DSS compliant infrastructure. DevKit never sees or stores card numbers, CVVs, or bank credentials.
            </li>
            <li>
              <strong>No Private Repository Secrets:</strong> We never inspect your personal GitHub repositories or access code outside the explicit packages uploaded to DevKit.
            </li>
            <li>
              <strong>Zero Third-Party Advertising Trackers:</strong> We do not load Google AdSense, Meta Pixel, or data broker cookies.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#b8531e]" />
            <span>3. Chat DLP &amp; Anti-Leak Protection</span>
          </h2>
          <p className="text-zinc-600">
            To protect users from accidental credential leakage, all in-app chat messages are processed by an automated client/server Data Loss Prevention (DLP) scanner. The scanner automatically detects and masks:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-600">
            <li>AWS, Stripe, and Razorpay API secrets</li>
            <li>RSA, SSH, and PEM private keys</li>
            <li>Credit card numbers and bank account identifiers</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-600" />
            <span>4. Data Retention &amp; Erasure</span>
          </h2>
          <p className="text-zinc-600">
            You may request complete erasure of your account, profile, and chat history by contacting <span className="font-mono text-zinc-900">privacy@devkit.store</span>. Order transaction records are retained solely for tax and accounting compliance.
          </p>
        </section>
      </div>
    </div>
  );
}
