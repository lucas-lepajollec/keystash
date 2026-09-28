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
    <header className="sticky top-0 z-30 bg-[var(--bg-app)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] pb-4 pt-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top row: Brand & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/30 shadow-xs">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                  {t.appName}
                </span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-mono">
                  {totalCount} {t.totalSecrets}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Secret Button */}
            <button
              onClick={onNewSecret}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newSecret}</span>
            </button>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 bg-[var(--bg-surface)]">
              <Globe className="w-3.5 h-3.5" />
              <select
                value={currentLocale}
                onChange={(e) => onLocaleChange(e.target.value as Locale)}
                className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono font-medium"
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
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title={t.themeToggle}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Lock Button */}
            <button
              onClick={onLockVault}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/20 transition-colors"
              title={t.lockVault}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-24 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl text-sm outline-none transition-all shadow-xs"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
              /
            </kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-[var(--text-primary)] text-[var(--bg-app)] font-semibold'
                : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-active)]'
            }`}
          >
            {t.allCategories}
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--text-primary)] text-[var(--bg-app)] font-semibold'
                  : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-active)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
