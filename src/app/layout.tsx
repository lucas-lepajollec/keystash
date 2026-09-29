import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-mono-stack',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KeyStash — Minimalist Secret Vault',
  description: 'Ultra-fast, self-hosted API token and secret manager for homelab and NAS.',
  manifest: '/manifest.json',
  applicationName: 'KeyStash',
  appleWebApp: {
    capable: true,
    title: 'KeyStash',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Applies the stored theme before first paint so light-mode users never
 * get a dark flash. Kept inline and dependency-free on purpose.
 */
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem('keystash_theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-dvh bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
