import type { Metadata, Viewport } from 'next';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';
import '@fontsource/chakra-petch/400.css';
import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#b8531e',
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
    <html lang="en">
      <body className="min-h-screen bg-[#fcfaf7] text-zinc-950 font-sans antialiased selection:bg-[#b8531e] selection:text-white">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
