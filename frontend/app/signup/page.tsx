'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function SignUpPage() {
  const router = useRouter();
  const { signup, loginWithOAuth } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signup(name, email, password);
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'operator') router.push('/operator');
      else router.push('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithOAuth(provider);
    } catch (err: any) {
      setErrorMsg(`Failed to connect with ${provider}.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/25 border border-white/20 text-white font-mono font-bold text-sm">
            DK
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">
            DevKit<span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">.store</span>
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Create Account
        </h1>
        <p className="text-xs text-zinc-400">
          Sign up to download and buy verified Next.js code kits.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.09] bg-[#090b10]/95 p-7 shadow-2xl backdrop-blur-2xl space-y-5">
        {/* Social Sign Up */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthSignUp('google')}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.12] bg-[#121620] px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#181d2a] hover:border-emerald-500/50 shadow-sm disabled:opacity-60"
          >
            {/* Google Colorful SVG */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthSignUp('github')}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.12] bg-[#121620] px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#181d2a] hover:border-blue-500/50 shadow-sm disabled:opacity-60"
          >
            {/* GitHub SVG */}
            <svg className="h-4 w-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>Sign up with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <span className="relative bg-[#090b10] px-3 text-[11px] font-mono text-zinc-500 uppercase">
            or sign up with email
          </span>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clean Email Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Ashutosh Dubey"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Password
              </label>
              <Input
                type="password"
                placeholder="At least 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-xs"
                required
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="leading-tight">
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Developer License: 100% source code ownership with commercial rights.');
                  }}
                  className="text-emerald-400 hover:underline"
                >
                  Terms of Service
                </a>{' '}
                and Privacy Policy.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-blue-500 text-black hover:opacity-90 shadow-md shadow-emerald-500/20 py-2.5 mt-2"
          >
            {isLoading ? 'Creating Account…' : 'Create Account →'}
          </Button>
        </form>

        {/* Link back to login */}
        <div className="text-center pt-2 text-xs text-zinc-400 border-t border-white/[0.07]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
