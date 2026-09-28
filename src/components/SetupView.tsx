'use client';

import React, { useState } from 'react';
import type { Translations, Locale } from '@/lib/i18n';
import { ShieldCheck, KeyRound, Globe, Sun, Moon } from 'lucide-react';

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

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Setup failed');
        setLoading(false);
        return;
      }

      onSetupSuccess();
    } catch {
      setError('Connection error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-app)]">
      {/* Top toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1 bg-[var(--bg-surface)]">
          <Globe className="w-3.5 h-3.5 opacity-70" />
          <select
            value={currentLocale}
            onChange={(e) => onLocaleChange(e.target.value as Locale)}
            className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono font-medium text-[var(--text-primary)] text-xs"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
            <option value="de">DE</option>
          </select>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title={t.themeToggle}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-400" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-xl p-7 bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] shadow-xl">
          {/* Logo mark */}
          <div className="flex justify-center mb-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-violet-400 border border-[var(--border-subtle)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <h1 className="text-base font-semibold text-center tracking-tight mb-1 text-[var(--text-primary)]">
            {t.setupTitle}
          </h1>
          <p className="text-xs text-center text-[var(--text-secondary)] mb-5">
            {t.setupSubtitle}
          </p>

          {error && (
            <div className="mb-4 p-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t.masterPasswordLabel}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.masterPasswordPlaceholder}
                  className="w-full pl-3 pr-9 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:border-violet-500 rounded-lg text-xs outline-none transition-colors placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                />
                <KeyRound className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t.confirmPasswordLabel}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.masterPasswordPlaceholder}
                className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:border-violet-500 rounded-lg text-xs outline-none transition-colors placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2 text-xs justify-center"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.saving}</span>
                </>
              ) : (
                <span>{t.setupButton}</span>
              )}
            </button>
          </form>
        </div>

        {/* Discreet footer brand */}
        <div className="text-center mt-5">
          <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">
            KeyStash · Encrypted Vault
          </span>
        </div>
      </div>
    </div>
  );
};
