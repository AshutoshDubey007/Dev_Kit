'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/' || pathname === '/kage';
  const isPureKage = pathname === '/kage';

  return (
    <div className={isPureKage ? "h-screen w-full overflow-hidden relative flex flex-col" : "min-h-screen flex flex-col justify-between relative"}>
      {/* Standard DevKit developer navbar is present across ALL routes including landing */}
      <Navbar />
      <main className={isLanding ? "flex-1 w-full relative" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative"}>
        {children}
      </main>
      {!isPureKage && <Footer />}
    </div>
  );
}
