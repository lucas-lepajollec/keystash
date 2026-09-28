'use client';

import React, { useState, useRef } from 'react';
import type { Translations } from '@/lib/i18n';
import type { SecretData } from './SecretRow';
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
      className="pro-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl bg-[var(--bg-surface)]/95 border border-[var(--border-subtle)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            {editingSecret ? t.modalEditTitle : t.modalNewTitle}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
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
            className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
          />
        </div>

        {/* Secret Value */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              {t.fieldSecret} {editingSecret ? '(leave empty to keep current)' : '*'}
            </label>
            <button
              type="button"
              onClick={handleGenerateSecret}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
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
              className="w-full pl-3.5 pr-10 py-2.5 font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
            />
            <KeyRound className="w-4 h-4 text-[var(--text-muted)] absolute right-3.5 top-3" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            {t.fieldCategory}
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t.fieldCategoryPlaceholder}
            className="w-full px-3.5 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-primary)] mb-2.5"
          />
          {/* Quick category chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categorySuggestions.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-0.5 text-xs rounded-md border transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-violet-500/15 text-violet-300 border-violet-500/30 font-semibold'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            {t.fieldTags}
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t.fieldTagsPlaceholder}
            className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-violet-500 rounded-lg text-xs outline-none transition-colors placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            {t.fieldNotes}
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.fieldNotesPlaceholder}
            className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] focus:border-violet-500 rounded-lg text-xs outline-none transition-colors placeholder:text-[var(--text-muted)] text-[var(--text-primary)] resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
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
