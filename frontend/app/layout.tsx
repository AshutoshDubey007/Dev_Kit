import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevKit Store | Verified Integration Kits for Next.js',
  description:
    'Curated marketplace of verified, reusable integration kits for Next.js 15. Tested on clean installs with automated tests and production edge-case handling.',
};

import { AuthProvider } from '../lib/auth-context';

import { LayoutShell } from '../components/layout-shell';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-600 selection:text-white">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
