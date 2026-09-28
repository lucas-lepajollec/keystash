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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Top toolbar */}
      <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 bg-[var(--bg-surface)]/80 backdrop-blur-md shadow-xs">
          <Globe className="w-3.5 h-3.5 text-violet-400" />
          <select
            value={currentLocale}
            onChange={(e) => onLocaleChange(e.target.value as Locale)}
            className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono font-medium text-[var(--text-primary)]"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
            <option value="de">DE</option>
          </select>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] transition-colors shadow-xs"
          title={t.themeToggle}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="pro-card rounded-2xl p-8 backdrop-blur-xl bg-[var(--bg-surface)]/90 shadow-2xl">
          {/* Logo badge with glow */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-30 blur-md" />
              <div className="relative w-14 h-14 rounded-2xl bg-[var(--bg-surface-elevated)] flex items-center justify-center text-violet-400 border border-violet-500/30 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-center tracking-tight mb-1 text-[var(--text-primary)]">
            {t.setupTitle}
          </h1>
          <p className="text-xs text-center text-[var(--text-secondary)] mb-6">
            {t.setupSubtitle}
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
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
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                />
                <KeyRound className="w-4 h-4 text-[var(--text-muted)] absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                {t.confirmPasswordLabel}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.masterPasswordPlaceholder}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 btn-violet text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.saving}</span>
                </>
              ) : (
                <span>{t.setupButton}</span>
              )}
            </button>
          </form>
        </div>

        {/* Discreet footer brand */}
        <div className="text-center mt-6">
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
            KeyStash • Zero-Knowledge Vault
          </span>
        </div>
      </div>
    </div>
  );
};
