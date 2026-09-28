'use client';

import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { translations, type Locale, type Translations } from '@/lib/i18n';
import { Sidebar } from './Sidebar';
import { VaultToolbar } from './VaultToolbar';
import { SecretRow, type SecretData } from './SecretRow';
import { SecretModal } from './SecretModal';
import { SetupView } from './SetupView';
import { LoginView } from './LoginView';
import { ShieldAlert, Plus } from 'lucide-react';

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
  const rawCategories = useMemo(() => {
    const set = new Set<string>();
    secrets.forEach((s) => {
      if (s.category && s.category !== 'General') set.add(s.category);
    });
    ['AI', 'Development', 'Infrastructure'].forEach((c) => set.add(c));
    return Array.from(set);
  }, [secrets]);

  // Categories with counts for Sidebar
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    secrets.forEach((s) => {
      const cat = s.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });
    return rawCategories.map((c) => ({
      name: c,
      count: map[c] || 0,
    }));
  }, [rawCategories, secrets]);

  // Copy secret with instant feedback
  const handleCopy = (secret: SecretData) => {
    if (!secret.value) return;
    navigator.clipboard.writeText(secret.value);
    setCopiedId(secret.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === secret.id ? null : prev));
    }, 2000);
  };

  // Global Keyboard shortcuts (Raycast interaction model)
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

      // Close modal, sidebar, or escape search
      if (e.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
        } else if (deleteId) {
          setDeleteId(null);
        } else if (mobileSidebarOpen) {
          setMobileSidebarOpen(false);
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
  }, [isModalOpen, deleteId, filteredSecrets, selectedIndex, authStatus.authenticated, mobileSidebarOpen]);

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
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">
            KEYSTASH VAULT...
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
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--bg-app)]">
      {/* Proton Pass style Left Navigation Sidebar */}
      <Sidebar
        t={t}
        currentLocale={locale}
        onLocaleChange={handleLocaleChange}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        categories={categoryCounts}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalCount={secrets.length}
        onLockVault={handleLockVault}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Vault Toolbar */}
        <VaultToolbar
          t={t}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          selectedCategory={selectedCategory}
          totalCount={secrets.length}
          filteredCount={filteredSecrets.length}
          onNewSecret={() => {
            setEditingSecret(null);
            setIsModalOpen(true);
          }}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Secret List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingSecrets ? (
            <div className="flex justify-center py-24">
              <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : filteredSecrets.length === 0 ? (
            /* Seamless canvas empty state — zero giant cards */
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
            /* Clean scannable rows */
            <div className="divide-y divide-[var(--border-subtle)]">
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
        </div>
      </div>

      {/* Secret Create / Edit Modal */}
      <SecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSecret}
        editingSecret={editingSecret}
        t={t}
        existingCategories={rawCategories}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl shadow-2xl p-5 bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-100">
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
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
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
