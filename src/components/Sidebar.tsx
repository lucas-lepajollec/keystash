'use client';

import React from 'react';
import type { Translations, Locale } from '@/lib/i18n';
import { Key, Folder, Globe, Sun, Moon, Lock, X } from 'lucide-react';

interface SidebarProps {
  t: Translations;
  currentLocale: Locale;
  onLocaleChange: (loc: Locale) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  categories: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  totalCount: number;
  onLockVault: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  t,
  currentLocale,
  onLocaleChange,
  isDark,
  onToggleTheme,
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
  onLockVault,
  mobileOpen,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col h-full select-none">
      {/* Brand header */}
      <div className="h-13 px-4 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 font-bold text-sm tracking-tight">◇</span>
          <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">
            {t.appName}
          </span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3 space-y-4">
        {/* Vault section */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            {t.vault}
          </div>
          <button
            onClick={() => {
              onSelectCategory('All');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-violet-500/15 text-violet-300 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Key className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="truncate">{t.allCategories}</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)] px-1.5 py-0.2 rounded bg-[var(--bg-surface)]">
              {totalCount}
            </span>
          </button>
        </div>

        {/* Categories section */}
        {categories.length > 0 && (
          <div>
            <div className="px-2 pb-1 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              {t.categories}
            </div>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      onSelectCategory(cat.name);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-violet-500/15 text-violet-300 font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {cat.count > 0 && (
                      <span className="text-[11px] font-mono text-[var(--text-muted)] px-1.5 py-0.2 rounded bg-[var(--bg-surface)]">
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom utilities */}
      <div className="p-2 border-t border-[var(--border-subtle)] shrink-0 space-y-1">
        <div className="flex items-center justify-between px-1">
          {/* Language selector */}
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
            <Globe className="w-3.5 h-3.5 opacity-70" />
            <select
              value={currentLocale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono font-medium text-[var(--text-primary)] text-[11px]"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="de">DE</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              title={t.themeToggle}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-400" />}
            </button>

            {/* Lock Button */}
            <button
              onClick={onLockVault}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-red-400 hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              title={t.lockVault}
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex w-56 lg:w-60 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] h-screen">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] h-full shadow-2xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
