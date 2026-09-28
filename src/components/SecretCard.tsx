'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n';
import { Copy, Check, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

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

interface SecretCardProps {
  secret: SecretData;
  t: Translations;
  isSelected: boolean;
  onCopy: (secret: SecretData) => void;
  isCopied: boolean;
  onEdit: (secret: SecretData) => void;
  onDelete: (id: string) => void;
}

export const SecretCard: React.FC<SecretCardProps> = ({
  secret,
  t,
  isSelected,
  onCopy,
  isCopied,
  onEdit,
  onDelete,
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all duration-150 ${
        isSelected
          ? 'bg-[var(--bg-surface-elevated)] border-[var(--accent)] shadow-sm'
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-active)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-base font-semibold text-[var(--text-primary)] truncate">
              {secret.name}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {secret.category}
            </span>
            {secret.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.2 text-[11px] font-mono rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                #{tag}
              </span>
            ))}
          </div>

          {secret.notes && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mb-2.5">
              {secret.notes}
            </p>
          )}

          {/* Masked / Revealed Secret Value */}
          <div className="inline-flex items-center gap-2 max-w-full">
            <div className="px-2.5 py-1 rounded-md bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] select-all truncate max-w-sm sm:max-w-md">
              {revealed ? secret.value : secret.masked_preview}
            </div>

            <button
              onClick={() => setRevealed(!revealed)}
              className="p-1 rounded hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              title={revealed ? t.hide : t.reveal}
            >
              {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Main Copy Button */}
          <button
            onClick={() => onCopy(secret)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isCopied
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white border border-[var(--accent)]/30'
            }`}
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

          {/* Edit Button */}
          <button
            onClick={() => onEdit(secret)}
            className="p-1.5 rounded-lg border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title={t.edit}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(secret.id)}
            className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
            title={t.delete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
