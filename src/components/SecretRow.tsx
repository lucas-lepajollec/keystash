'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { fill, type Translations } from '@/lib/i18n';

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
  onDelete: (secret: SecretData) => void;
  /** Vault-wide reveal; overrides the row's own toggle. */
  revealAll: boolean;
  onRevealIndividually: () => void;
  /** Vault-wide reveal is active, so the value column claims more room. */
  expanded: boolean;
}

const REVEAL_TIMEOUT_MS = 15_000;

export const SecretRow: React.FC<SecretRowProps> = ({
  secret,
  t,
  isSelected,
  onCopy,
  isCopied,
  onEdit,
  onDelete,
  revealAll,
  onRevealIndividually,
  expanded,
}) => {
  const [ownRevealed, setOwnRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealed = revealAll || ownRevealed;

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('keydown', handleKey);
      return () => {
        document.removeEventListener('mousedown', handlePointerDown);
        document.removeEventListener('keydown', handleKey);
      };
    }
  }, [menuOpen]);

  // A revealed secret must not stay on screen indefinitely.
  useEffect(() => {
    if (!revealed) return;
    revealTimer.current = setTimeout(() => setOwnRevealed(false), REVEAL_TIMEOUT_MS);
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [revealed]);

  // The vault-wide reveal owns its own timer; the row timer must not touch it.
  const toggleReveal = useCallback(() => {
    if (revealAll) {
      onRevealIndividually();
      return;
    }
    setOwnRevealed((v) => !v);
  }, [revealAll, onRevealIndividually]);

  return (
    <li
      data-selected={isSelected || undefined}
      className={`group relative flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 transition-colors duration-100 sm:grid sm:gap-x-4 ${
        expanded
          ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,24rem)_auto]'
          : 'sm:grid-cols-[minmax(0,1fr)_15rem_auto]'
      } ${
        isSelected
          ? 'bg-accent-soft'
          : 'hover:bg-sunken'
      }`}
    >
      {/* Selection marker: colour plus a shape cue, never colour alone */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-0 w-[2px] rounded-r-full transition-all duration-150 ${
          isSelected ? 'bg-accent' : 'bg-transparent'
        }`}
      />

      {/* Identity — full width on narrow screens, flexible on wide ones */}
      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-medium leading-5 text-ink">
            {secret.name}
          </span>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.071em] text-ink-3">
            {secret.category}
          </span>
        </div>

        {secret.notes && (
          <p className="truncate text-[11px] leading-4 text-ink-3">{secret.notes}</p>
        )}

        {secret.tags.length > 0 && (
          <p className="truncate text-[11px] leading-4 text-ink-3">
            {secret.tags.map((tag) => `#${tag}`).join('  ')}
          </p>
        )}
      </div>

      {/* Value + reveal — fixed column so every pill lines up */}
      <div className="flex min-w-0 items-center justify-end gap-1 sm:min-w-0">
        <code
          className={`min-w-0 rounded bg-inset px-2 py-1 text-right font-mono text-[11px] leading-4 text-ink-2 ring-hair select-all ${
            expanded
              ? 'break-all sm:w-full'
              : 'truncate sm:w-[13rem]'
          }`}
          title={secret.value}
        >
          {revealed ? secret.value : secret.masked_preview}
        </code>
        <button
          type="button"
          onClick={toggleReveal}
          className="btn-icon size-7 shrink-0"
          title={revealed ? t.hide : t.reveal}
          aria-label={fill(revealed ? t.hide : t.reveal, { name: secret.name })}
          aria-pressed={revealed}
        >
          {revealed ? (
            <EyeOff className="size-3.5" aria-hidden="true" />
          ) : (
            <Eye className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Actions — always reachable, never hover-only, so touch stays usable */}
      <div className="ml-auto flex items-center justify-end gap-1 sm:ml-0">
        <button
          type="button"
          onClick={() => onCopy(secret)}
          className={`btn h-7 gap-1.5 px-2.5 text-[11px] ${
            isCopied
              ? 'bg-success-soft text-success'
              : 'text-ink-2 hover:bg-accent-soft hover:text-accent-ink'
          }`}
          aria-label={fill(t.copyAria, { name: secret.name })}
        >
          {isCopied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          <span>{isCopied ? t.copied : t.copy}</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="btn-icon size-7"
            title={t.actions}
            aria-label={`${t.actions} — ${secret.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="anim-fade-in absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-md bg-raised py-1 ring-hair-strong"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(secret);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                {t.edit}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(secret);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs text-danger transition-colors hover:bg-danger-soft"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                {t.delete}
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};
