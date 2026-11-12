'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Package,
  FileCode,
  LifeBuoy,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Kit } from '../../types/kit';
import { KITS } from '../../data/kits';
import { getKitBySlug, fetchKitBySlugFromApi } from '../../lib/kits-store';
import { useAuth } from '../../lib/auth-context';
import { formatPriceINR, formatPriceUSD } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();

  const kitSlugParam = searchParams.get('kitSlug') || searchParams.get('slug') || '';
  const kitIdParam = searchParams.get('kitId') || searchParams.get('id') || '';
  const targetId = kitSlugParam || kitIdParam || 'nextjs-razorpay-pro';

  const [kit, setKit] = useState<Kit | undefined>(() => {
    return (
      getKitBySlug(targetId) ||
      KITS.find((k) => k.slug === targetId || k.id === targetId)
    );
  });
  const [isLoadingKit, setIsLoadingKit] = useState(!kit);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update prefill if user logs in
  useEffect(() => {
    if (currentUser?.name) setName((prev) => prev || currentUser.name || '');
    if (currentUser?.email) setEmail((prev) => prev || currentUser.email || '');
  }, [currentUser]);

  // Load kit asynchronously from DB
  useEffect(() => {
    let isMounted = true;
    fetchKitBySlugFromApi(targetId)
      .then((fetched) => {
        if (isMounted) {
          if (fetched) setKit(fetched);
          setIsLoadingKit(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingKit(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  // Track checkout initiation
  useEffect(() => {
    if (targetId) {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'checkout_initiated',
          entityId: targetId,
          path: '/checkout',
        }),
      }).catch(() => {});
    }
  }, [targetId]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!kit) {
      setErrorMessage('No kit selected for checkout.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please provide your name and email address for order fulfillment.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on server and save to MongoDB
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitSlug: kit.slug,
          kitId: kit.id,
          customerEmail: email.trim().toLowerCase(),
          customerName: name.trim(),
          kitData: kit,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create checkout order');
      }

      // 2. Sandbox / Test Simulation Mode
      if (orderData.isSimulated) {
        const verifyRes = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpaySignature: 'simulated_test_signature',
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || 'Failed to complete payment verification');
        }

        router.push(
          `/order/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}&convId=${
            verifyData.conversationId || ''
          }&email=${encodeURIComponent(email)}`
        );
        return;
      }

      // 3. Live Razorpay Payment Modal
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay payment SDK. Please check your connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        name: 'DevKit Marketplace',
        description: kit.title,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name,
          email,
        },
        theme: {
          color: '#10b981',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            router.push(
              `/order/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}&convId=${
                verifyData.conversationId || ''
              }&email=${encodeURIComponent(email)}`
            );
          } catch (err: any) {
            setErrorMessage(err.message || 'Error completing payment verification.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment initiation error.');
      setIsProcessing(false);
    }
  };

  if (isLoadingKit) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-[#cc6b35] border-t-transparent rounded-full mx-auto" />
        <p className="text-xs font-mono text-zinc-600">Loading checkout order details...</p>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-[#faf5ef] border border-orange-200 flex items-center justify-center mx-auto text-2xl">
          📦
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-950">No Product Selected</h2>
          <p className="text-xs text-zinc-600 mt-1">
            Please browse the marketplace catalog and select an architecture kit or repository to purchase.
          </p>
        </div>
        <Link href="/kits">
          <Button variant="primary" size="md">
            Browse All Marketplace Kits →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6 space-y-8">
      {/* Top Breadcrumb & Trust Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-200 pb-4">
        <Link
          href={`/kits/${kit.slug}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Product Specification</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-zinc-600 font-mono">
          <span className="flex items-center gap-1.5 text-[#b8531e]">
            <ShieldCheck className="h-4 w-4" />
            <span>7-Day Verification Guarantee</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-zinc-600">
            <Lock className="h-3.5 w-3.5 text-zinc-600" />
            <span>256-Bit SSL Checkout</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Summary & Deliverables */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-orange-200 bg-white p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm" className="capitalize">
                {kit.category}
              </Badge>
              <Badge variant="success" size="sm">
                Verified Clean Build
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {kit.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {kit.tagline || kit.shortDescription}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-600">
              <span className="rounded-lg bg-[#faf5ef] px-2.5 py-1 border border-orange-200">
                {kit.framework}
              </span>
              <span className="rounded-lg bg-[#faf5ef] px-2.5 py-1 border border-orange-200">
                ★ {kit.rating?.toFixed(1) || '5.0'} ({kit.reviewCount || 1} verified)
              </span>
              <span className="rounded-lg bg-[#faf5ef] px-2.5 py-1 border border-orange-200">
                Commercial License
              </span>
            </div>
          </div>

          {/* Included Deliverables */}
          <div className="rounded-2xl border border-orange-200 bg-white p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
              Deliverables Included with Order:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-800">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0 mt-0.5" />
                <span>Instant .ZIP Source Code Package download</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0 mt-0.5" />
                <span>100% Passing Automated Test Suite</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0 mt-0.5" />
                <span>Step-by-step Setup README injected into Chat</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0 mt-0.5" />
                <span>Direct Author In-App Support Channel</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0 mt-0.5" />
                <span>7-Day Product Verification Window</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#b8531e] shrink-0 mt-0.5" />
                <span>Unlimited personal &amp; client commercial projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout & Payment Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-2xl space-y-6 backdrop-blur-2xl">
            <div>
              <span className="text-xs font-mono text-zinc-600 block mb-1">
                Order Total (One-Time)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950">
                  {formatPriceINR(kit.priceINR)}
                </span>
                <span className="text-xs sm:text-sm text-zinc-600 font-mono">
                  ({formatPriceUSD(kit.priceUSD)})
                </span>
              </div>
              <span className="text-[11px] text-[#b8531e] font-medium block mt-1">
                ✓ No monthly recurring fees • Lifetime usage license
              </span>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-500/40 bg-red-50 p-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-800">
                  Full Name / Agency Name *
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ashutosh Dubey"
                  className="bg-white border-orange-200 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-800">
                  Email Address for Delivery *
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ashutosh@agency.dev"
                  className="bg-white border-orange-200 text-xs h-10"
                />
                <span className="text-[10px] text-zinc-600 block">
                  Your secure download token and verification guarantee link will be assigned to this email.
                </span>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isProcessing}
                  className="w-full text-sm font-semibold shadow-xl shadow-[#e8c3a8] py-6"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                      <span>Initiating Secure Gateway...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-950 fill-emerald-950" />
                      <span>Pay {formatPriceINR(kit.priceINR)} &amp; Download</span>
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <div className="border-t border-orange-200 pt-4 space-y-2 text-[11px] text-zinc-600 font-mono">
              <div className="flex items-center justify-between">
                <span>Payment Gateway:</span>
                <span className="text-zinc-900">Razorpay Encrypted</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Support Channel:</span>
                <span className="text-zinc-900">DevKit In-App Chat</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification Window:</span>
                <span className="text-[#b8531e]">7-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-[#cc6b35] border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-mono text-zinc-600">Preparing secure checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
