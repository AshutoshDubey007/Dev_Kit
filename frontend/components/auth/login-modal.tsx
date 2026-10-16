'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function LoginModal() {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginWithCredentials,
    loginWithOAuth,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLoginModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithCredentials(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithOAuth(provider);
    } catch {
      setErrorMsg(`Failed to connect with ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={closeLoginModal} />

      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0c0d12]/95 p-6 shadow-2xl backdrop-blur-2xl z-10 space-y-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden border border-white/20 shadow-md shadow-indigo-500/20 bg-black shrink-0">
              <Image
                src="/logo.png"
                alt="DevKit Marketplace Logo"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Sign In to DevKit</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Access your downloads, orders, and support chats.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            className="text-zinc-500 hover:text-white font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Social OAuth Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#141822] px-3 py-2.5 text-xs font-medium text-white transition-all hover:border-emerald-500/50 hover:bg-[#1a202e] disabled:opacity-60"
          >
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
            <span>Google</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#141822] px-3 py-2.5 text-xs font-medium text-white transition-all hover:border-blue-500/50 hover:bg-[#1a202e] disabled:opacity-60"
          >
            <svg className="h-4 w-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <span className="relative bg-[#0c0d12] px-2.5 text-[10px] font-mono text-zinc-500 uppercase">
            or continue with email
          </span>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Basic Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full text-xs font-semibold mt-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-black hover:opacity-90 shadow-md shadow-emerald-500/20 py-2.5"
          >
            {isLoading ? 'Signing In…' : 'Sign In →'}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 text-[11px] text-zinc-400 border-t border-white/[0.07]">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            onClick={closeLoginModal}
            className="font-semibold text-emerald-400 hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
