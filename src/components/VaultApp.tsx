'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Lock, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { fill, translations, LOCALES, type Locale, type Translations } from '@/lib/i18n';
import { SecretRow, type SecretData } from './SecretRow';
import { SecretModal, type SecretDraft } from './SecretModal';
import { SetupView } from './SetupView';
import { LoginView } from './LoginView';
import { KeyStashLogo } from './KeyStashLogo';
import { LocaleSelect } from './LocaleSelect';
import { SidebarNav } from './SidebarNav';
import { copyToClipboard } from '@/lib/clipboard';
import { createStoredValue, useStoredValue, themeCodec, localeCodec } from '@/lib/useStoredValue';

const themeStore = createStoredValue('keystash_theme', themeCodec);
const localeStore = createStoredValue('keystash_locale', localeCodec(LOCALES));

interface AuthStatus {
  loading: boolean;
  configured: boolean;
  authenticated: boolean;
}

const IDLE: AuthStatus = { loading: true, configured: false, authenticated: false };

const REVEAL_ALL_TIMEOUT_MS = 15_000;

function formatRelative(timestamp: number, t: Translations, locale: Locale): string {
  if (!timestamp) return t.never;
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.348],
    ['month', 12],
  ];
  let value = -seconds;
  for (const [unit, size] of units) {
    if (Math.abs(value) < size) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        Math.round(value),
        unit,
      );
    }
    value /= size;
  }
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    Math.round(value),
    'year',
  );
}

export const VaultApp: React.FC = () => {
  const [locale, setLocale] = useStoredValue(localeStore) as [Locale, (l: Locale) => void];
  const [isDark, setIsDark] = useStoredValue(themeStore);

  const [auth, setAuth] = useState<AuthStatus>(IDLE);
  const [secrets, setSecrets] = useState<SecretData[]>([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<SecretData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SecretData | null>(null);
  const [cursor, setCursor] = useState(-1);
  const [revealAll, setRevealAll] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const t: Translations = translations[locale];

  /* ---------- theme + locale sync ---------- */

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  /* ---------- data ---------- */

  const loadVault = useCallback(async () => {
    setLoadingSecrets(true);
    try {
      const res = await fetch('/api/secrets', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSecrets(data.secrets ?? []);
      }
    } finally {
      setLoadingSecrets(false);
    }
  }, []);

  const syncAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status', { cache: 'no-store' });
      const data = await res.json();
      const authenticated = Boolean(data.authenticated);
      setAuth({
        loading: false,
        configured: Boolean(data.configured),
        authenticated,
      });
      if (authenticated) {
        await loadVault();
      } else {
        setSecrets([]);
      }
      return authenticated;
    } catch {
      setAuth({ loading: false, configured: false, authenticated: false });
      return false;
    }
  }, [loadVault]);

  useEffect(() => {
    // `syncAuth` awaits the network before touching state, so this is an async
    // subscription rather than a synchronous setState during render.
    const boot = async () => {
      await syncAuth();
    };
    void boot();
  }, [syncAuth]);

  /* ---------- derived ---------- */

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of secrets) {
      const key = s.category || 'General';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => (a === 'AI' ? -1 : b === 'AI' ? 1 : a.localeCompare(b)))
      .map(([name, count]) => ({ name, count }));
  }, [secrets]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return secrets.filter((s) => {
      if (category && s.category !== category) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [secrets, query, category]);

  const vaultIsEmpty = secrets.length === 0;

  const lastUpdated = useMemo(
    () => secrets.reduce((max, s) => Math.max(max, s.updated_at), 0),
    [secrets],
  );

  // The vault-wide reveal is time-boxed exactly like a single-row reveal.
  useEffect(() => {
    if (!revealAll) return;
    const timer = setTimeout(() => setRevealAll(false), REVEAL_ALL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [revealAll]);

  const toggleRevealAll = useCallback(() => setRevealAll((v) => !v), []);
  const clearRevealAll = useCallback(() => setRevealAll(false), []);

  // Derived, not synchronised: a filter change can never leave the keyboard
  // cursor pointing past the end of the list.
  const activeCursor = visible.length === 0 ? -1 : Math.min(cursor, visible.length - 1);

  const resetFilters = useCallback(() => {
    setQuery('');
    setCategory(null);
  }, []);

  /* ---------- actions ---------- */

  const handleCopy = useCallback(
    async (secret: SecretData) => {
      if (!secret.value) return;
      if (await copyToClipboard(secret.value)) {
        setCopiedId(secret.id);
        window.setTimeout(() => {
          setCopiedId((prev) => (prev === secret.id ? null : prev));
        }, 2000);
      }
    },
    [],
  );

  const handleSave = useCallback(
    async (draft: SecretDraft) => {
      const isUpdate = Boolean(draft.id);
      const res = await fetch(isUpdate ? `/api/secrets/${draft.id}` : '/api/secrets', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t.saveFailed);
      }
      const { secret } = await res.json();
      setSecrets((prev) =>
        isUpdate
          ? prev.map((s) => (s.id === secret.id ? secret : s))
          : [secret, ...prev],
      );
    },
    [t.saveFailed],
  );

  const handleDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const res = await fetch(`/api/secrets/${pendingDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setSecrets((prev) => prev.filter((s) => s.id !== pendingDelete.id));
    }
    setPendingDelete(null);
  }, [pendingDelete]);

  const handleLock = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setSecrets([]);
    setAuth((prev) => ({ ...prev, authenticated: false }));
  }, []);

  const openNew = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);

  /* ---------- keyboard ---------- */

  useEffect(() => {
    if (!auth.authenticated) return;

    function onKeyDown(e: KeyboardEvent) {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement;

      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      if (e.key === 'Escape') {
        if (pendingDelete) {
          setPendingDelete(null);
        } else if (sheetOpen) {
          setSheetOpen(false);
        } else if (typing) {
          (el as HTMLElement).blur();
        }
        return;
      }

      if (typing) return;

      if (e.key.toLowerCase() === 'n' && !sheetOpen) {
        e.preventDefault();
        openNew();
        return;
      }

      if (visible.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((prev) => (prev < visible.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((prev) => (prev > 0 ? prev - 1 : visible.length - 1));
      } else if ((e.key === 'Enter' || e.key.toLowerCase() === 'c') && activeCursor >= 0) {
        e.preventDefault();
        const target = visible[activeCursor];
        if (target) void handleCopy(target);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    auth.authenticated,
    visible,
    activeCursor,
    sheetOpen,
    pendingDelete,
    handleCopy,
    openNew,
  ]);

  useEffect(() => {
    if (pendingDelete) confirmRef.current?.focus();
  }, [pendingDelete]);

  /* ---------- gates ---------- */

  if (auth.loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
        <span className="spinner" aria-hidden="true" />
        <span className="font-mono text-[11px] tracking-widest text-ink-3">
          {t.appName.toUpperCase()}
        </span>
      </div>
    );
  }

  if (!auth.configured) {
    return (
      <SetupView
        t={t}
        currentLocale={locale}
        onLocaleChange={setLocale}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onSetupSuccess={syncAuth}
      />
    );
  }

  if (!auth.authenticated) {
    return (
      <LoginView
        t={t}
        currentLocale={locale}
        onLocaleChange={setLocale}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onLoginSuccess={syncAuth}
      />
    );
  }

  /* ---------- vault ---------- */

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation rail — browse without searching */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-8 flex flex-col gap-6">
            <SidebarNav
              entries={[{ name: null, count: secrets.length }, ...categories]}
              active={category}
              onSelect={setCategory}
              t={t}
            />

            <div className="rounded-md bg-surface p-3 ring-hair">
              <h2 className="stamp mb-2.5">
                {t.overviewTitle}
              </h2>
              <dl className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-[11px] text-ink-2">{t.statSecrets}</dt>
                  <dd className="font-mono text-[11px] tabular-nums text-ink">
                    {secrets.length}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-[11px] text-ink-2">{t.statCategories}</dt>
                  <dd className="font-mono text-[11px] tabular-nums text-ink">
                    {categories.length}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-[11px] text-ink-2">{t.statLastUpdate}</dt>
                  <dd className="truncate font-mono text-[11px] text-ink">
                    {formatRelative(lastUpdated, t, locale)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <KeyStashLogo className="size-[18px] shrink-0" />
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-ink">
              {t.appName}
            </h1>
            <span className="stamp hidden shrink-0 sm:inline">
              {secrets.length} {t.totalSecrets}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <LocaleSelect locale={locale} onChange={setLocale} t={t} />
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="btn-icon"
              title={t.themeToggle}
              aria-label={t.themeToggle}
            >
              {isDark ? (
                <Sun className="size-3.5" aria-hidden="true" />
              ) : (
                <Moon className="size-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={handleLock}
              className="btn-icon"
              title={t.lockVault}
              aria-label={t.lockVault}
            >
              <Lock className="size-3.5" aria-hidden="true" />
            </button>
            <button type="button" onClick={openNew} className="btn-primary ml-1 px-2.5 sm:px-3">
              <Plus className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t.newSecret}</span>
              <span className="sr-only sm:hidden">{t.newSecret}</span>
            </button>
          </div>
        </header>

        {/* Search + vault-wide reveal */}
        <div className="mt-5 flex items-center gap-2">          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              role="searchbox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && query) {
                  e.stopPropagation();
                  setQuery('');
                }
              }}
              aria-label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              className="field h-[30px] pl-8 pr-20 [&::-webkit-search-cancel-button]:hidden"
            />
            <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                  className="btn-icon pointer-events-auto size-6"
                  aria-label={t.clearSearch}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              ) : (
                <>
                  <kbd className="kbd">/</kbd>
                  <kbd className="kbd hidden sm:inline-flex">⌘K</kbd>
                </>
              )}
            </div>
          </div>

          {secrets.length > 0 && (
            <button
              type="button"
              onClick={toggleRevealAll}
              aria-pressed={revealAll}
              className={`btn h-[30px] shrink-0 px-2.5 text-[12px] ${
                revealAll
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-2 ring-hair hover:bg-sunken hover:text-ink'
              }`}
              title={revealAll ? t.hideAll : t.revealAll}
            >
              {revealAll ? (
                <EyeOff className="size-3.5" aria-hidden="true" />
              ) : (
                <Eye className="size-3.5" aria-hidden="true" />
              )}
              <span className="hidden md:inline">{revealAll ? t.hideAll : t.revealAll}</span>
            </button>
          )}
        </div>

        {/* Categories: rail on desktop, scroller below it */}
        {categories.length > 0 && (
          <nav
            aria-label={t.categoriesLabel}
            className="no-scrollbar -mx-4 mt-3 flex items-center gap-1 overflow-x-auto px-4 lg:hidden"
          >
            {[{ name: null, count: secrets.length }, ...categories].map((item) => {
              const active = category === item.name;
              return (
                <button
                  key={item.name ?? '__all'}
                  type="button"
                  onClick={() => setCategory(active ? null : item.name)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-[12px] transition-colors ${
                    active
                      ? 'bg-accent-soft font-medium text-accent-ink'
                      : 'text-ink-2 hover:bg-sunken hover:text-ink'
                  }`}
                >
                  {item.name ?? t.allCategories}
                  <span className="font-mono text-[10px] opacity-60">{item.count}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Results */}
        <main className="mt-4">
          <p aria-live="polite" className="sr-only">
            {fill(t.resultsCount, { count: visible.length })}
          </p>

          {loadingSecrets ? (
            <div className="flex justify-center py-20">
              <span className="spinner" aria-hidden="true" />
            </div>
          ) : vaultIsEmpty ? (
            <EmptyState
              title={t.emptyTitle}
              subtitle={t.emptySubtitle}
              actionLabel={t.addSecret}
              onAction={openNew}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title={t.noResultsTitle}
              subtitle={t.noResultsSubtitle}
              actionLabel={t.clearSearch}
              onAction={resetFilters}
            />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-md bg-surface ring-hair">
              {visible.map((secret, index) => (
                <SecretRow
                  key={secret.id}
                  secret={secret}
                  t={t}
                  isSelected={activeCursor === index}
                  onCopy={(s) => void handleCopy(s)}
                  isCopied={copiedId === secret.id}
                  onEdit={(s) => {
                    setEditing(s);
                    setSheetOpen(true);
                  }}
                  onDelete={(target) => setPendingDelete(target)}
                  revealAll={revealAll}
                  onRevealIndividually={clearRevealAll}
                  expanded={revealAll}
                />
              ))}
            </ul>
          )}
        </main>
        </div>
      </div>

      <SecretModal
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        editingSecret={editing}
        t={t}
        existingCategories={categories.map((c) => c.name)}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="anim-fade-in absolute inset-0 bg-[var(--bg-overlay)]"
            onClick={() => setPendingDelete(null)}
            aria-hidden="true"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-body"
            className="anim-fade-in relative w-full max-w-sm rounded-md bg-surface p-5 ring-hair-strong"
          >
            <h2 id="confirm-delete-title" className="text-[13px] font-medium text-ink">
              {t.confirmDeleteTitle}
            </h2>
            <p id="confirm-delete-body" className="mt-2 text-xs leading-relaxed text-ink-2">
              {t.confirmDeleteMessage}
            </p>
            <p className="mt-3 truncate font-mono text-[11px] text-ink-3">
              {pendingDelete.name}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="btn-ghost"
              >
                {t.cancel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={() => void handleDelete()}
                className="btn bg-danger px-3 text-[13px] text-white hover:opacity-90"
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

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, subtitle, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
    <KeyStashLogo className="mb-4 size-7 opacity-90" />
    <h2 className="text-[13px] font-medium tracking-tight text-ink">{title}</h2>
    <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-ink-2">{subtitle}</p>
    <button type="button" onClick={onAction} className="btn-primary mt-5">
      {actionLabel}
    </button>
  </div>
);
