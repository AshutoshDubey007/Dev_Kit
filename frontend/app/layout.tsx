import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#07090e',
};

export const metadata: Metadata = {
  title: 'DevKit Marketplace | Verified Integration Kits for Next.js',
  description:
    'Curated marketplace of verified, reusable integration kits for Next.js 15. Tested on clean installs with automated tests and production edge-case handling.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
