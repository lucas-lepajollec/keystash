'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Translations } from '@/lib/i18n';
import { Copy, Check, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export interface SecretData {
  id: string;
  name: string;
  category: string;
  tags: string[];
  notes: string;
  masked_preview: string;
  value: string;
  created_at: number;
  updated_at: number;
}

interface SecretRowProps {
  secret: SecretData;
  t: Translations;
  isSelected: boolean;
  onCopy: (secret: SecretData) => void;
  isCopied: boolean;
  onEdit: (secret: SecretData) => void;
  onDelete: (id: string) => void;
}

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  return `${Math.floor(diffDays / 30)}mo`;
}

export const SecretRow: React.FC<SecretRowProps> = ({
  secret,
  t,
  isSelected,
  onCopy,
  isCopied,
  onEdit,
  onDelete,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--border-subtle)] transition-colors ${
        isSelected
          ? 'bg-violet-500/10 dark:bg-violet-500/10'
          : 'hover:bg-[var(--bg-surface)]'
      }`}
    >
      {/* Selected indicator bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#7C3AED]" />
      )}

      {/* Left: Name, Category, Tags, Notes */}
      <div className="flex-1 min-w-0 pr-3 mb-2 sm:mb-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {secret.name}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            · {secret.category}
          </span>
          {secret.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>

        {secret.notes && (
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {secret.notes}
          </p>
        )}
      </div>

      {/* Middle: Masked secret pill */}
      <div className="flex items-center gap-1.5 shrink-0 my-1 sm:my-0 sm:mx-3">
        <div className="px-2.5 py-1 rounded bg-black/30 dark:bg-[#07080a] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] select-all truncate max-w-[200px] sm:max-w-[240px]">
          {revealed ? secret.value : secret.masked_preview}
        </div>
        <button
          onClick={() => setRevealed(!revealed)}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
          title={revealed ? t.hide : t.reveal}
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5 text-violet-400" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Right: Timestamp, Copy Button & Menu */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0">
        <span className="text-[11px] font-mono text-[var(--text-muted)] sm:min-w-[45px] sm:text-right">
          {formatTimeAgo(secret.updated_at)}
        </span>

        {/* Primary Copy Button */}
        <button
          onClick={() => onCopy(secret)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            isCopied
              ? 'bg-emerald-600 text-white'
              : 'bg-[var(--bg-surface-elevated)] hover:bg-[#7C3AED] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] hover:border-transparent'
          }`}
          title="Press Enter to copy"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{t.copied}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{t.copy}</span>
            </>
          )}
        </button>

        {/* Secondary Actions Overflow Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            title={t.actions}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Contextual dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(secret);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] text-left cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{t.edit}</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(secret.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 text-left cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.delete}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
