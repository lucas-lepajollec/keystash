'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import type { Locale, Translations } from '@/lib/i18n';
import { KeyStashLogo } from './KeyStashLogo';
import { LocaleSelect } from './LocaleSelect';

interface AuthShellProps {
  title: string;
  subtitle: string;
  error: string | null;
  isDark: boolean;
  locale: Locale;
  t: Translations;
  onLocaleChange: (locale: Locale) => void;
  onToggleTheme: () => void;
  children: React.ReactNode;
  submitLabel: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  error,
  isDark,
  locale,
  t,
  onLocaleChange,
  onToggleTheme,
  children,
  submitLabel,
  loading,
  onSubmit,
}) => {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <LocaleSelect locale={locale} onChange={onLocaleChange} t={t} />
        <button
          type="button"
          onClick={onToggleTheme}
          className="btn-icon"
          title={t.themeToggle}
          aria-label={t.themeToggle}
        >
          {isDark ? (
            <Sun className="size-3.5" aria-hidden="true" />
          ) : (
            <Moon className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      <main className="relative z-10 w-full max-w-[22rem]">
        <div className="rounded-md bg-surface p-7 ring-hair">
          <div className="mb-6 flex justify-center">
            <KeyStashLogo className="size-9" />
          </div>

          <h1 className="text-center text-[15px] font-medium tracking-tight text-ink">
            {title}
          </h1>
          <p className="mx-auto mt-1.5 max-w-[17rem] text-center text-xs leading-relaxed text-ink-2">
            {subtitle}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-md bg-danger-soft px-3 py-2 text-xs text-danger ring-hair"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {children}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2">
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>{t.saving}</span>
                </>
              ) : (
                <span>{submitLabel}</span>
              )}
            </button>
          </form>
        </div>

        <p className="stamp mt-5 text-center">
          {t.appName} · {t.vault}
        </p>
      </main>
    </div>
  );
};
