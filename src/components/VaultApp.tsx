'use client';

import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { translations, type Locale, type Translations } from '@/lib/i18n';
import { SecretRow, type SecretData } from './SecretRow';
import { SecretModal } from './SecretModal';
import { SetupView } from './SetupView';
import { LoginView } from './LoginView';
import { Plus, Search, Globe, Sun, Moon, Lock, ShieldAlert } from 'lucide-react';

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

  // Filter secrets based on search & category
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

  // Extract all categories with real counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    secrets.forEach((s) => {
      const cat = s.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryList = Object.keys(counts).sort((a, b) => {
      if (a === 'AI') return -1;
      if (b === 'AI') return 1;
      return a.localeCompare(b);
    });

    return [
      { name: 'All', count: secrets.length },
      ...categoryList.map((c) => ({ name: c, count: counts[c] || 0 })),
    ];
  }, [secrets]);

  // Copy secret with instant feedback
  const handleCopy = (secret: SecretData) => {
    if (!secret.value) return;
    navigator.clipboard.writeText(secret.value);
    setCopiedId(secret.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === secret.id ? null : prev));
    }, 2000);
  };

  // Global Keyboard shortcuts (Raycast model)
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

      // Close modal / sheet / clear search
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

      // New secret shortcut: 'n' when not typing in an input
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">
            KEYSTASH...
          </span>
        </div>
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
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] antialiased">
      {/* Centered Main Workspace (approx 960px) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Top Header Row */}
        <header className="flex items-center justify-between gap-4 pb-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="text-violet-400 font-bold text-base select-none">◇</span>
            <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">
              {t.appName}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              {secrets.length} {t.totalSecrets}
            </span>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 bg-[var(--bg-surface)]">
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <select
                value={locale}
                onChange={(e) => handleLocaleChange(e.target.value as Locale)}
                className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono font-medium text-[var(--text-primary)] text-xs"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
                <option value="de">DE</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title={t.themeToggle}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-400" />}
            </button>

            {/* Lock Button */}
            <button
              onClick={handleLockVault}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-red-400 transition-colors cursor-pointer"
              title={t.lockVault}
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                setEditingSecret(null);
                setIsModalOpen(true);
              }}
              className="btn-primary ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.newSecret}</span>
            </button>
          </div>
        </header>

        {/* Raycast-style Command Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-20 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-violet-500 rounded-lg text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="kbd-key">/</kbd>
            <kbd className="kbd-key hidden sm:inline-flex">Ctrl K</kbd>
          </div>
        </div>

        {/* Compact Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-4 pt-1">
          {categoryCounts.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`}
              >
                <span>{cat.name === 'All' ? t.allCategories : cat.name}</span>
                <span className="text-[10px] font-mono opacity-70">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Secrets List (Clean Rows, Zero Outer Card) */}
        <main className="mt-2">
          {loadingSecrets ? (
            <div className="flex justify-center py-24">
              <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : filteredSecrets.length === 0 ? (
            /* Seamless empty state on canvas */
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center select-none">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-violet-400 mb-3">
                <span className="text-sm font-bold">◇</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight mb-1">
                {t.emptyTitle}
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs mb-4">
                {t.emptySubtitle}
              </p>
              <button
                onClick={() => {
                  setEditingSecret(null);
                  setIsModalOpen(true);
                }}
                className="btn-primary"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addSecret}</span>
              </button>
            </div>
          ) : (
            /* Clean Rows List */
            <div className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
              {filteredSecrets.map((secret, index) => (
                <SecretRow
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
      </div>

      {/* Right Slide-over Sheet for Secret Create / Edit */}
      <SecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSecret}
        editingSecret={editingSecret}
        t={t}
        existingCategories={categoryCounts.map((c) => c.name).filter((c) => c !== 'All')}
      />

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl shadow-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 mb-2.5 text-red-400">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {t.confirmDeleteTitle}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
              {t.confirmDeleteMessage}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDeleteSecret(deleteId)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
