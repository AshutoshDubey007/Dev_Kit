'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Kit } from '../../types/kit';
import { formatPriceINR, formatPriceUSD } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface CheckoutModalProps {
  kit: Kit;
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function CheckoutModal({ kit, isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Load Razorpay script dynamically
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

  const handleStartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please enter your name and email address.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create order on server and save to MongoDB
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitSlug: kit.slug,
          customerEmail: email,
          customerName: name,
          kitData: kit,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 2. If running with test placeholder or sandbox simulation mode
      if (orderData.isSimulated) {
        // Verify simulated order directly
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
          throw new Error(verifyData.error || 'Failed to verify payment');
        }

        onClose();
        router.push(
          `/order/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}&convId=${verifyData.conversationId || ''}&email=${encodeURIComponent(
            email
          )}`
        );
        return;
      }

      // 3. Real Razorpay Checkout flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        name: 'DevKit Store',
        description: kit.title,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name,
          email,
        },
        theme: {
          color: '#cc6b35',
        },
        handler: async function (response: any) {
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
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            onClose();
            router.push(
              `/order/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}&convId=${verifyData.conversationId || ''}&email=${encodeURIComponent(
                email
              )}`
            );
          } catch (err: any) {
            setErrorMessage(err.message || 'Error completing payment verification');
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong processing your order');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border-2 border-[#cc6b35] bg-white p-6 shadow-[6px_6px_0px_#cc6b35] z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-orange-100 pb-4">
          <div className="flex flex-col">
            <h3 className="text-base font-pixel font-bold text-zinc-950">Instant Checkout</h3>
            <span className="text-xs text-zinc-600">{kit.title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#b8531e] hover:text-zinc-950 text-sm font-pixel font-bold"
          >
            ✕
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="rounded-xl border-2 border-orange-200 bg-[#faf5ef] p-3.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-700">Total Price (Commercial License)</span>
            <span className="text-xs text-[#b8531e] font-pixel font-bold">Lifetime access &amp; updates</span>
          </div>
          <div className="text-right">
            <span className="text-base font-arcade text-[#b8531e]">
              {formatPriceINR(kit.priceINR)}
            </span>
            <span className="text-xs text-zinc-600 font-pixel block">
              ({formatPriceUSD(kit.priceUSD)})
            </span>
          </div>
        </div>

        {/* Buyer Information Form */}
        <form onSubmit={handleStartCheckout} className="space-y-4">
          <div>
            <label className="block text-xs font-pixel font-bold text-zinc-800 mb-1">
              Your Full Name
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ashutosh Dubey"
            />
          </div>

          <div>
            <label className="block text-xs font-pixel font-bold text-zinc-800 mb-1">
              Email Address (for download delivery)
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@agency.com"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border-2 border-red-400 bg-red-50 p-2.5 text-xs text-red-800 font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-xs mt-2"
          >
            {isLoading ? 'Processing...' : `Pay ${formatPriceINR(kit.priceINR)} & Download`}
          </Button>

          <p className="text-[11px] text-zinc-600 text-center">
            🔒 Secured by Razorpay • UPI, Netbanking, Cards &amp; Wallets supported
          </p>
        </form>
      </div>
    </div>
  );
}
