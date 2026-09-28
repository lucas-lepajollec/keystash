'use client';

import React, { useState, useRef } from 'react';
import type { Translations } from '@/lib/i18n';
import type { SecretData } from './SecretCard';
import { X, Sparkles, KeyRound } from 'lucide-react';

interface SecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    secret: string;
    category: string;
    tags: string[];
    notes: string;
  }) => Promise<void>;
  editingSecret?: SecretData | null;
  t: Translations;
  existingCategories: string[];
}

const PRESET_CATEGORIES = ['AI', 'Development', 'Infrastructure', 'Finance', 'Personal'];

interface FormProps {
  editingSecret?: SecretData | null;
  t: Translations;
  existingCategories: string[];
  onClose: () => void;
  onSave: SecretModalProps['onSave'];
}

const ModalForm: React.FC<FormProps> = ({
  editingSecret,
  t,
  existingCategories,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(editingSecret?.name || '');
  const [secret, setSecret] = useState('');
  const [category, setCategory] = useState(editingSecret?.category || 'AI');
  const [tags, setTags] = useState(editingSecret?.tags.join(', ') || '');
  const [notes, setNotes] = useState(editingSecret?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const generated = Array.from(array, (byte) => chars[byte % chars.length]).join('');
    setSecret(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.fieldTitle + ' is required.');
      return;
    }

    if (!editingSecret && !secret) {
      setError(t.fieldSecret + ' is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedTags = tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        id: editingSecret?.id,
        name,
        secret,
        category: category.trim() || 'General',
        tags: parsedTags,
        notes,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save error');
    } finally {
      setLoading(false);
    }
  };

  const categorySuggestions = Array.from(
    new Set([...PRESET_CATEGORIES, ...existingCategories])
  ).filter(Boolean);

  return (
    <div
      className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {editingSecret ? t.modalEditTitle : t.modalNewTitle}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {t.fieldTitle} *
          </label>
          <input
            ref={nameInputRef}
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.fieldNamePlaceholder}
            className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg text-sm outline-none transition-colors"
          />
        </div>

        {/* Secret Value */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              {t.fieldSecret} {editingSecret ? '(leave empty to keep current)' : '*'}
            </label>
            <button
              type="button"
              onClick={handleGenerateSecret}
              className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              <span>{t.generateToken}</span>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              required={!editingSecret}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={
                editingSecret ? '•••••••••••••••• (unchanged)' : t.fieldSecretPlaceholder
              }
              className="w-full px-3 py-2 font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg text-sm outline-none transition-colors"
            />
            <KeyRound className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {t.fieldCategory}
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t.fieldCategoryPlaceholder}
            className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg text-sm outline-none transition-colors mb-2"
          />
          {/* Quick category chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categorySuggestions.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                  category === cat
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/40 font-medium'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {t.fieldTags}
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t.fieldTagsPlaceholder}
            className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg text-sm outline-none transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {t.fieldNotes}
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.fieldNotesPlaceholder}
            className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg text-sm outline-none transition-colors resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? t.saving : t.save}
          </button>
        </div>
      </form>
    </div>
  );
};

export const SecretModal: React.FC<SecretModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSecret,
  t,
  existingCategories,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <ModalForm
        key={editingSecret?.id || 'new'}
        editingSecret={editingSecret}
        t={t}
        existingCategories={existingCategories}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
};
