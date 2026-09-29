'use client';

import React from 'react';
import { FolderClosed, Layers } from 'lucide-react';
import type { Translations } from '@/lib/i18n';

export interface NavEntry {
  /** `null` means "every category". */
  name: string | null;
  count: number;
}

interface SidebarNavProps {
  entries: NavEntry[];
  active: string | null;
  onSelect: (name: string | null) => void;
  t: Translations;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  entries,
  active,
  onSelect,
  t,
}) => (
  <nav aria-label={t.sidebarLabel} className="flex flex-col gap-0.5">
    {entries.map((entry) => {
      const selected = active === entry.name;
      const Icon = entry.name === null ? Layers : FolderClosed;
      return (
        <button
          key={entry.name ?? '__all'}
          type="button"
          onClick={() => onSelect(entry.name)}
          aria-current={selected ? 'true' : undefined}
          className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors ${
            selected
              ? 'bg-accent-soft font-medium text-accent-ink'
              : 'text-ink-2 hover:bg-sunken hover:text-ink'
          }`}
        >
          <Icon
            className={`size-3.5 shrink-0 ${selected ? 'opacity-100' : 'opacity-50'}`}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">{entry.name ?? t.allCategories}</span>
          <span className="shrink-0 font-mono text-[10px] tabular-nums tracking-wide text-ink-3">
            {entry.count}
          </span>
        </button>
      );
    })}
  </nav>
);
