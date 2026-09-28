import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KeyStash — Minimalist Secret Vault',
  description: 'Ultra-fast, self-hosted API token and secret manager for homelab and NAS.',
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/logo.svg',
    apple: '/assets/logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KeyStash',
  },
};

export const viewport: Viewport = {
  themeColor: '#090a0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] antialiased transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
