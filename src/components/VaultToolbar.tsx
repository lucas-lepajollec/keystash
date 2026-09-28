'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n';
import { Search, Plus, Menu } from 'lucide-react';

interface VaultToolbarProps {
  t: Translations;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  selectedCategory: string;
  totalCount: number;
  filteredCount: number;
  onNewSecret: () => void;
  onOpenMobileSidebar: () => void;
}

export const VaultToolbar: React.FC<VaultToolbarProps> = ({
  t,
  searchQuery,
  onSearchChange,
  searchInputRef,
  selectedCategory,
  totalCount,
  filteredCount,
  onNewSecret,
  onOpenMobileSidebar,
}) => {
  return (
    <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)] shrink-0">
      {/* Top action row */}
      <div className="h-13 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile menu trigger */}
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
            title="Open sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 truncate">
            <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] truncate">
              {selectedCategory === 'All' ? t.vault : selectedCategory}
            </h1>
            <span className="text-[11px] font-mono text-[var(--text-muted)] px-1.5 py-0.2 rounded bg-[var(--bg-surface-elevated)] shrink-0">
              {filteredCount} {filteredCount !== totalCount && `/ ${totalCount}`}
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onNewSecret}
          className="btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.newSecret}</span>
        </button>
      </div>

      {/* Integrated Search Row */}
      <div className="px-4 sm:px-6 py-2 border-t border-[var(--border-subtle)]/60 bg-[var(--bg-surface)]/20">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-8.5 pr-20 py-1.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:border-violet-500 rounded-md text-xs outline-none transition-colors placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
          />
          <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="kbd-key">/</kbd>
            <kbd className="kbd-key hidden sm:inline-flex">Ctrl+K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
