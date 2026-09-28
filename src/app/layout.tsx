import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KeyStash — Minimalist Secret Vault',
  description: 'Ultra-fast, self-hosted API token and secret manager for homelab and NAS.',
  icons: {
    icon: '/assets/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
