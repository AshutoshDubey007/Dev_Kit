import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';

export const metadata: Metadata = {
  title: 'DevKit Store | Verified Integration Kits for Next.js',
  description:
    'Curated marketplace of verified, reusable integration kits for Next.js 15. Tested on clean installs with automated tests and production edge-case handling.',
};

import { AuthProvider } from '../lib/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
