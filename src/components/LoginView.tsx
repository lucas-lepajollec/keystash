'use client';

import React, { useState } from 'react';
import type { Translations, Locale } from '@/lib/i18n';
import { Lock, KeyRound, Globe, Sun, Moon } from 'lucide-react';

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

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setError(t.rateLimited);
        } else {
          setError(data.error || t.invalidPassword);
        }
        setLoading(false);
        return;
      }

      onLoginSuccess();
    } catch {
      setError('Connection error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Top toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-md px-2 py-1 bg-[var(--bg-surface)]">
          <Globe className="w-3.5 h-3.5" />
          <select
            value={currentLocale}
            onChange={(e) => onLocaleChange(e.target.value as Locale)}
            className="bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title={t.themeToggle}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
            <Lock className="w-7 h-7" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center mb-1 text-[var(--text-primary)]">
          {t.loginTitle}
        </h1>
        <p className="text-sm text-center text-[var(--text-secondary)] mb-6">
          {t.loginSubtitle}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg text-sm outline-none transition-colors"
              />
              <KeyRound className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? t.saving : t.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
};
