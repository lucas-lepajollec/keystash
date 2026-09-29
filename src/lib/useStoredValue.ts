'use client';

import { useCallback, useSyncExternalStore } from 'react';

const EVENT = 'keystash:store-change';
const listeners = new Set<() => void>();

interface StoredValue<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
}

const cache = new Map<string, StoredValue<unknown>>();

export interface Codec<T> {
  /** Reads the stored representation. Must handle `null` for "never set". */
  decode: (raw: string | null) => T;
  /** Writes the stored representation. Must round-trip through `decode`. */
  encode: (value: T) => string;
  /** Value used for the server render; must match the inline layout bootstrap. */
  serverDefault: T;
}

/**
 * Cross-tab aware localStorage value with an explicit codec.
 *
 * The codec exists because the read and write encodings must agree exactly.
 * Writing `String(false)` and reading it back with a `!== 'light'` check
 * silently produces a value that never round-trips, which makes the control
 * look dead: storage changes but the parsed value never changes.
 *
 * `subscribe`, `getSnapshot` and `getServerSnapshot` are stable per key, so
 * `useSyncExternalStore` can read it without a hydration mismatch or a
 * setState-in-effect cascade.
 */
export function createStoredValue<T>(key: string, codec: Codec<T>): StoredValue<T> {
  const existing = cache.get(key);
  if (existing) return existing as StoredValue<T>;

  const value: StoredValue<T> = {
    subscribe(onChange) {
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) onChange();
      };
      const onLocal = () => onChange();
      listeners.add(onChange);
      window.addEventListener('storage', onStorage);
      window.addEventListener(EVENT, onLocal);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener('storage', onStorage);
        window.removeEventListener(EVENT, onLocal);
      };
    },
    getSnapshot() {
      return codec.decode(window.localStorage.getItem(key));
    },
    getServerSnapshot() {
      return codec.serverDefault;
    },
    set(next) {
      window.localStorage.setItem(key, codec.encode(next));
      listeners.forEach((listener) => listener());
    },
  };

  cache.set(key, value as StoredValue<unknown>);
  return value;
}

export function useStoredValue<T>(
  value: StoredValue<T>,
): [T, (next: T) => void] {
  const current = useSyncExternalStore(
    value.subscribe,
    value.getSnapshot,
    value.getServerSnapshot,
  );
  const set = useCallback((next: T) => value.set(next), [value]);
  return [current, set];
}

/** Dark is the default everywhere; the layout bootstrap script agrees. */
export const themeCodec: Codec<boolean> = {
  decode: (raw) => (raw === null ? true : raw === 'dark'),
  encode: (value) => (value ? 'dark' : 'light'),
  serverDefault: true,
};

export function localeCodec(valid: readonly string[]): Codec<string> {
  return {
    decode: (raw) => (raw && valid.includes(raw) ? raw : 'en'),
    encode: (value) => value,
    serverDefault: 'en',
  };
}
