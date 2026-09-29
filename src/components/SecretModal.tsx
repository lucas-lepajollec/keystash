'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dices, X } from 'lucide-react';
import type { Translations } from '@/lib/i18n';
import type { SecretData } from './SecretRow';

export interface SecretDraft {
  id?: string;
  name: string;
  secret: string;
  category: string;
  tags: string[];
  notes: string;
}

interface SecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SecretDraft) => Promise<void>;
  editingSecret: SecretData | null;
  t: Translations;
  existingCategories: string[];
}

const SUGGESTED_CATEGORIES = ['AI', 'Development', 'Infrastructure', 'Media', 'Finance', 'Personal'];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function SheetForm({
  editingSecret,
  t,
  existingCategories,
  onClose,
  onSave,
}: Omit<SecretModalProps, 'isOpen'>) {
  const [name, setName] = useState(editingSecret?.name ?? '');
  const [secret, setSecret] = useState('');
  const [category, setCategory] = useState(editingSecret?.category ?? '');
  const [tags, setTags] = useState(editingSecret?.tags.join(', ') ?? '');
  const [notes, setNotes] = useState(editingSecret?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Keep Tab inside the sheet while it owns the screen.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleGenerate = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = new Uint8Array(40);
    crypto.getRandomValues(bytes);
    setSecret(Array.from(bytes, (b) => alphabet[b % alphabet.length]).join(''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.fieldRequired);
      nameRef.current?.focus();
      return;
    }
    if (!editingSecret && !secret) {
      setError(t.fieldRequired);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        id: editingSecret?.id,
        name,
        secret,
        category: category.trim(),
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveFailed);
      setLoading(false);
    }
  };

  const suggestions = Array.from(
    new Set([...SUGGESTED_CATEGORIES, ...existingCategories]),
  ).filter(Boolean);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="secret-sheet-title"
      className="anim-sheet-in flex h-full w-full flex-col bg-surface sm:max-w-[24rem] ring-hair"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3">
        <h2 id="secret-sheet-title" className="text-[13px] font-medium tracking-tight text-ink">
          {editingSecret ? t.modalEditTitle : t.modalNewTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="btn-icon size-7"
          aria-label={t.closeSheet}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>

      <form
        id="secret-sheet-form"
        onSubmit={handleSubmit}
        className="ks-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5"
      >
        {error && (
          <div
            role="alert"
            className="rounded-md bg-danger-soft px-3 py-2 text-xs text-danger ring-hair"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="secret-name" className="field-label">
            {t.fieldTitle}
          </label>
          <input
            id="secret-name"
            ref={nameRef}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.fieldNamePlaceholder}
            className="field"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor="secret-value" className="field-label mb-0">
              {t.fieldSecret}
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center gap-1 text-[11px] font-medium text-accent-fg transition-colors hover:text-accent"
            >
              <Dices className="size-3" aria-hidden="true" />
              {t.generateToken}
            </button>
          </div>
          <input
            id="secret-value"
            type="text"
            required={!editingSecret}
            autoComplete="off"
            spellCheck={false}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={
              editingSecret ? t.fieldSecretKeepHint : t.fieldSecretPlaceholder
            }
            className="field font-mono"
          />
          {editingSecret && (
            <p className="mt-1.5 text-[11px] text-ink-3">{t.fieldSecretKeepHint}</p>
          )}
        </div>

        <div>
          <label htmlFor="secret-category" className="field-label">
            {t.fieldCategory}
          </label>
          <input
            id="secret-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t.fieldCategoryPlaceholder}
            className="field"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {suggestions.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(active ? '' : item)}
                  aria-pressed={active}
                  className={`rounded px-2 py-1 text-[11px] transition-colors ${
                    active
                      ? 'bg-accent-soft font-medium text-accent-ink ring-hair'
                      : 'text-ink-3 ring-hair hover:bg-sunken hover:text-ink'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="secret-tags" className="field-label">
            {t.fieldTags}
          </label>
          <input
            id="secret-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t.fieldTagsPlaceholder}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="secret-notes" className="field-label">
            {t.fieldNotes}
          </label>
          <textarea
            id="secret-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.fieldNotesPlaceholder}
            className="field resize-none"
          />
        </div>
      </form>

      <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
        <button type="button" onClick={onClose} className="btn-ghost">
          {t.cancel}
        </button>
        <button
          type="submit"
          form="secret-sheet-form"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {t.saving}
            </>
          ) : (
            t.save
          )}
        </button>
      </footer>
    </div>
  );
}

export const SecretModal: React.FC<SecretModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSecret,
  t,
  existingCategories,
}) => {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="anim-fade-in absolute inset-0 bg-[var(--bg-overlay)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <SheetForm
        key={editingSecret?.id ?? 'new'}
        editingSecret={editingSecret}
        t={t}
        existingCategories={existingCategories}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
};
