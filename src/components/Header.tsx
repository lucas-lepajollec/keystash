'use client';

import React from 'react';
import type { Translations, Locale } from '@/lib/i18n';
import { Search, Plus, Lock, Globe, Sun, Moon, Key } from 'lucide-react';

interface HeaderProps {
  t: Translations;
  currentLocale: Locale;
  onLocaleChange: (loc: Locale) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNewSecret: () => void;
  onLockVault: () => void;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  currentLocale,
  onLocaleChange,
  isDark,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  searchInputRef,
  categories,
  selectedCategory,
  onSelectCategory,
  onNewSecret,
  onLockVault,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-app)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)] pb-4 pt-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-3.5">
        {/* Top row: Brand & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-40 blur-xs" />
              <div className="relative w-8 h-8 rounded-xl bg-[var(--bg-surface-elevated)] flex items-center justify-center text-violet-400 border border-violet-500/40 shadow-xs">
                <Key className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                {t.appName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span>
                  {totalCount} {t.totalSecrets}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Secret Button */}
            <button
              onClick={onNewSecret}
              className="btn-violet flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.newSecret}</span>
            </button>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 bg-[var(--bg-surface)] hover:border-[var(--border-active)] transition-colors">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
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

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] transition-colors cursor-pointer"
              title={t.themeToggle}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
            </button>

            {/* Lock Button */}
            <button
              onClick={onLockVault}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
              title={t.lockVault}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Raycast-style Command Search Bar */}
        <div className="relative group">
          <Search className="w-4 h-4 text-[var(--text-muted)] group-focus-within:text-violet-400 transition-colors absolute left-3.5 top-3" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-24 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
            <kbd className="kbd-key">/</kbd>
            <kbd className="kbd-key hidden sm:inline-flex">Ctrl+K</kbd>
          </div>
        </div>

        {/* Linear-style Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-violet-500/15 text-violet-400 dark:text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
            }`}
          >
            {t.allCategories}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-500/15 text-violet-400 dark:text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
