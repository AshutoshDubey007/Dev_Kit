'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../lib/auth-context';

export default function FeedbackPage() {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<'product_quality' | 'installation_friction' | 'feature_request' | 'general'>('general');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!message.trim()) {
      setErrorMessage('Please share your thoughts or observations.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || currentUser?.name || 'Anonymous',
          email: email.trim().toLowerCase() || currentUser?.email || 'anon@devkit.store',
          role: currentUser?.role || 'buyer',
          rating,
          category,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 pb-20">
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
            Beta Feedback
          </Badge>
          <span className="text-xs text-zinc-600 font-mono">Customer Validation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
          Help Us Build What You Actually Need
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
          Tell us about your experience discovering, installing, or purchasing code on DevKit. Every note is reviewed by our engineering team within 24 hours.
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-2xl border border-[#cc6b35] bg-[#f7ece1] p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#f7ece1] text-[#b8531e] flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h2 className="text-lg font-bold text-zinc-950">Thank You for Your Feedback!</h2>
          <p className="text-xs text-zinc-800 max-w-md mx-auto leading-relaxed">
            Your insight directly influences our 30-day beta validation priorities. We appreciate your partnership in making software development faster and cleaner.
          </p>
          <div className="pt-2">
            <Link href="/kits">
              <Button variant="primary" size="sm" className="text-xs font-semibold">
                Explore Marketplace Kits →
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-orange-200 bg-white p-6 sm:p-8 space-y-6 shadow-xl">
          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-800">
              Overall Platform Experience
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center text-sm font-bold transition-all ${
                    rating >= star
                      ? 'bg-[#f7ece1] border-[#cc6b35] text-[#b8531e] shadow-sm'
                      : 'bg-[#faf5ef] border-orange-200 text-zinc-600 hover:text-zinc-800'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs font-mono text-zinc-600 ml-2">
                {rating === 5 ? 'Exceptional' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-800">
              What is your feedback about?
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'general', label: 'General Experience' },
                { id: 'installation_friction', label: 'Installation / Setup Friction' },
                { id: 'product_quality', label: 'Code Quality / Testing' },
                { id: 'feature_request', label: 'Missing Integration Request' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`p-2.5 rounded-xl border text-left font-mono text-[11px] transition-all ${
                    category === cat.id
                      ? 'bg-[#f7ece1] border-[#cc6b35] text-[#b8531e]'
                      : 'bg-[#faf5ef] border-orange-200 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-800">
              Your Feedback or Suggestion *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What worked well? What failed or felt confusing? Which template or integration would save you 20 hours of work?"
              className="w-full rounded-xl border border-orange-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:border-[#cc6b35] transition-colors leading-relaxed"
            />
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-800">Your Name (Optional)</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ashutosh Dubey"
                className="bg-white border-orange-200 text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-800">Email Address (Optional)</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ashutosh@agency.dev"
                className="bg-white border-orange-200 text-xs h-9"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full text-xs font-semibold py-5"
          >
            {isSubmitting ? 'Submitting...' : 'Send Beta Feedback →'}
          </Button>
        </form>
      )}
    </div>
  );
}
