import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { ProgressNav } from '@/components/layout/ProgressNav';
import { THEME_SCRIPT } from '@/components/layout/ThemeToggle';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const description =
  'An interactive look at high blood pressure: where it is, who carries it, and the levers that move it. The web companion to the poster The Pressure We Live In.';

export const metadata: Metadata = {
  title: 'Between the Beats',
  description,
  openGraph: {
    title: 'Between the Beats',
    description,
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The theme script may set data-theme before React hydrates, so that attribute can differ.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-pulse focus:px-4 focus:py-3 focus:font-semibold focus:text-on-pulse"
        >
          Skip to main content
        </a>
        <SmoothScroll />
        <ProgressNav />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
