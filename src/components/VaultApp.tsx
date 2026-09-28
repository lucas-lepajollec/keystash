'use client';

import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { translations, type Locale, type Translations } from '@/lib/i18n';
import { Header } from './Header';
import { SecretCard, type SecretData } from './SecretCard';
import { SecretModal } from './SecretModal';
import { SetupView } from './SetupView';
import { LoginView } from './LoginView';
import { ShieldAlert, Plus, Keyboard } from 'lucide-react';

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getLocaleSnapshot(): Locale {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('keystash_locale') as Locale | null;
  return saved && ['en', 'fr', 'es', 'de'].includes(saved) ? saved : 'en';
}

function getThemeSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('keystash_theme') !== 'light';
}

export const VaultApp: React.FC = () => {
  const storedLocale = useSyncExternalStore(subscribeToStorage, getLocaleSnapshot, () => 'en' as Locale);
  const storedIsDark = useSyncExternalStore(subscribeToStorage, getThemeSnapshot, () => true);

  const [localeOverride, setLocaleOverride] = useState<Locale | null>(null);
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null);

  const locale: Locale = localeOverride ?? storedLocale;
  const isDark: boolean = themeOverride ?? storedIsDark;

  const [authStatus, setAuthStatus] = useState<{
    loading: boolean;
    configured: boolean;
    authenticated: boolean;
  }>({
    loading: true,
    configured: false,
    authenticated: false,
  });

  const [secrets, setSecrets] = useState<SecretData[]>([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<SecretData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (ignore) return;

        setAuthStatus({
          loading: false,
          configured: data.configured,
          authenticated: data.authenticated,
        });

        if (data.authenticated) {
          setLoadingSecrets(true);
          const secRes = await fetch('/api/secrets');
          if (!ignore && secRes.ok) {
            const secData = await secRes.json();
            setSecrets(secData.secrets || []);
          }
          if (!ignore) setLoadingSecrets(false);
        }
      } catch {
        if (!ignore) {
          setAuthStatus({
            loading: false,
            configured: false,
            authenticated: false,
          });
          setLoadingSecrets(false);
        }
      }
    }

    void loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  const refreshAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setAuthStatus({
        loading: false,
        configured: data.configured,
        authenticated: data.authenticated,
      });

      if (data.authenticated) {
        setLoadingSecrets(true);
        const secRes = await fetch('/api/secrets');
        if (secRes.ok) {
          const secData = await secRes.json();
          setSecrets(secData.secrets || []);
        }
        setLoadingSecrets(false);
      }
    } catch {
      setAuthStatus({
        loading: false,
        configured: false,
        authenticated: false,
      });
    }
  };

  const t: Translations = translations[locale];

  const handleLocaleChange = (newLocale: Locale) => {
    setLocaleOverride(newLocale);
    localStorage.setItem('keystash_locale', newLocale);
  };

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setThemeOverride(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('keystash_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('keystash_theme', 'light');
    }
  };

  // Filter secrets
  const filteredSecrets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return secrets.filter((s) => {
      const matchesCategory =
        selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;
      if (!q) return true;

      const inName = s.name.toLowerCase().includes(q);
      const inCategory = s.category.toLowerCase().includes(q);
      const inNotes = s.notes.toLowerCase().includes(q);
      const inTags = s.tags.some((tag) => tag.toLowerCase().includes(q));

      return inName || inCategory || inNotes || inTags;
    });
  }, [secrets, searchQuery, selectedCategory]);

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    secrets.forEach((s) => {
      if (s.category && s.category !== 'General') set.add(s.category);
    });
    ['AI', 'Development', 'Infrastructure'].forEach((c) => set.add(c));
    return Array.from(set);
  }, [secrets]);

  // Copy secret with feedback
  const handleCopy = (secret: SecretData) => {
    if (!secret.value) return;
    navigator.clipboard.writeText(secret.value);
    setCopiedId(secret.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === secret.id ? null : prev));
    }, 2000);
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      // Focus search: / or Ctrl+K / Cmd+K
      if ((e.key === '/' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Close modal or escape search
      if (e.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
        } else if (deleteId) {
          setDeleteId(null);
        } else if (isInput) {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      // New secret shortcut: 'n' when not typing in input
      if (e.key.toLowerCase() === 'n' && !isInput && !isModalOpen && authStatus.authenticated) {
        e.preventDefault();
        setEditingSecret(null);
        setIsModalOpen(true);
        return;
      }

      // Arrow navigation
      if (!isInput && !isModalOpen && filteredSecrets.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredSecrets.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredSecrets.length - 1));
        } else if ((e.key === 'Enter' || e.key.toLowerCase() === 'c') && selectedIndex >= 0) {
          e.preventDefault();
          const target = filteredSecrets[selectedIndex];
          if (target) {
            handleCopy(target);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, deleteId, filteredSecrets, selectedIndex, authStatus.authenticated]);

  const handleSaveSecret = async (data: {
    id?: string;
    name: string;
    secret: string;
    category: string;
    tags: string[];
    notes: string;
  }) => {
    const isUpdate = Boolean(data.id);
    const url = isUpdate ? `/api/secrets/${data.id}` : '/api/secrets';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save');
    }

    const { secret: saved } = await res.json();
    if (isUpdate) {
      setSecrets((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
    } else {
      setSecrets((prev) => [saved, ...prev]);
    }
  };

  const handleDeleteSecret = async (id: string) => {
    try {
      const res = await fetch(`/api/secrets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSecrets((prev) => prev.filter((s) => s.id !== id));
        setDeleteId(null);
      }
    } catch {
      // Handle error
    }
  };

  const handleLockVault = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthStatus((prev) => ({ ...prev, authenticated: false }));
      setSecrets([]);
    }
  };

  // Loading state
  if (authStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Setup required
  if (!authStatus.configured) {
    return (
      <SetupView
        t={t}
        currentLocale={locale}
        onLocaleChange={handleLocaleChange}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onSetupSuccess={refreshAuth}
      />
    );
  }

  // Login required
  if (!authStatus.authenticated) {
    return (
      <LoginView
        t={t}
        currentLocale={locale}
        onLocaleChange={handleLocaleChange}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onLoginSuccess={refreshAuth}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Header */}
      <Header
        t={t}
        currentLocale={locale}
        onLocaleChange={handleLocaleChange}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNewSecret={() => {
          setEditingSecret(null);
          setIsModalOpen(true);
        }}
        onLockVault={handleLockVault}
        totalCount={secrets.length}
      />

      {/* Main Secret List Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6">
        {loadingSecrets ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSecrets.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)]/50">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--text-muted)] mx-auto mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              {t.noSecretsFound}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mb-4">
              {t.noSecretsHint}
            </p>
            <button
              onClick={() => {
                setEditingSecret(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newSecret}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSecrets.map((secret, index) => (
              <SecretCard
                key={secret.id}
                secret={secret}
                t={t}
                isSelected={selectedIndex === index}
                onCopy={handleCopy}
                isCopied={copiedId === secret.id}
                onEdit={(s) => {
                  setEditingSecret(s);
                  setIsModalOpen(true);
                }}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer shortcut hints */}
      <footer className="fixed bottom-0 inset-x-0 bg-[var(--bg-app)]/80 backdrop-blur-xs border-t border-[var(--border-subtle)] py-2 px-4 text-center">
        <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1">
          <Keyboard className="w-3.5 h-3.5 inline" />
          <span>{t.shortcutsHint}</span>
        </p>
      </footer>

      {/* Secret Create / Edit Modal */}
      <SecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSecret}
        editingSecret={editingSecret}
        t={t}
        existingCategories={categories}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3 text-red-500">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {t.confirmDeleteTitle}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              {t.confirmDeleteMessage}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDeleteSecret(deleteId)}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-xs"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
