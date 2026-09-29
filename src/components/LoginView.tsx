'use client';

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import type { Locale, Translations } from '@/lib/i18n';
import { AuthShell } from './AuthShell';

interface LoginViewProps {
  t: Translations;
  currentLocale: Locale;
  onLocaleChange: (loc: Locale) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  t,
  currentLocale,
  onLocaleChange,
  isDark,
  onToggleTheme,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(res.status === 429 ? t.rateLimited : (data.error ?? t.invalidPassword));
        setLoading(false);
        return;
      }

      onLoginSuccess();
    } catch {
      setError(t.connectionError);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t.loginTitle}
      subtitle={t.loginSubtitle}
      error={error}
      isDark={isDark}
      locale={currentLocale}
      t={t}
      onLocaleChange={onLocaleChange}
      onToggleTheme={onToggleTheme}
      submitLabel={t.loginButton}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <div>
        <label htmlFor="master-password" className="field-label">
          {t.masterPasswordLabel}
        </label>
        <div className="relative">
          <input
            id="master-password"
            name="master-password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="field pr-9"
          />
          <KeyRound
            className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
        </div>
      </div>
    </AuthShell>
  );
};
