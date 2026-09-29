'use client';

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import type { Locale, Translations } from '@/lib/i18n';
import { AuthShell } from './AuthShell';

interface SetupViewProps {
  t: Translations;
  currentLocale: Locale;
  onLocaleChange: (loc: Locale) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onSetupSuccess: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  t,
  currentLocale,
  onLocaleChange,
  isDark,
  onToggleTheme,
  onSetupSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t.setupFailed);
        setLoading(false);
        return;
      }

      onSetupSuccess();
    } catch {
      setError(t.connectionError);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t.setupTitle}
      subtitle={t.setupSubtitle}
      error={error}
      isDark={isDark}
      locale={currentLocale}
      t={t}
      onLocaleChange={onLocaleChange}
      onToggleTheme={onToggleTheme}
      submitLabel={t.setupButton}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <div>
        <label htmlFor="new-password" className="field-label">
          {t.masterPasswordLabel}
        </label>
        <div className="relative">
          <input
            id="new-password"
            name="new-password"
            type="password"
            required
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.masterPasswordPlaceholder}
            className="field pr-9"
          />
          <KeyRound
            className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="field-label">
          {t.confirmPasswordLabel}
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t.masterPasswordPlaceholder}
          className="field"
        />
      </div>
    </AuthShell>
  );
};
