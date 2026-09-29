import { beforeEach, describe, expect, it } from 'vitest';
import {
  createStoredValue,
  localeCodec,
  themeCodec,
} from '../src/lib/useStoredValue';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
}

const listeners = new Set<() => void>();
const eventTarget = {
  addEventListener: (_: string, cb: () => void) => void listeners.add(cb),
  removeEventListener: (_: string, cb: () => void) => void listeners.delete(cb),
};

Object.assign(globalThis, { window: { localStorage: memoryStorage(), ...eventTarget } });

/** Cached stores are module-level, so each test needs a unique key. */
let seq = 0;
const uniqueKey = () => `test_key_${(seq += 1)}`;

describe('themeCodec', () => {
  it('round-trips light through storage', () => {
    expect(themeCodec.decode(themeCodec.encode(false))).toBe(false);
  });

  it('round-trips dark through storage', () => {
    expect(themeCodec.decode(themeCodec.encode(true))).toBe(true);
  });

  it('defaults to dark when never set', () => {
    expect(themeCodec.decode(null)).toBe(true);
  });

  // Regression: the store used to write String(false) === "false" while the
  // reader only understood "light", so the toggle never changed anything.
  it('never writes a value its own reader cannot parse', () => {
    for (const value of [true, false]) {
      const raw = themeCodec.encode(value);
      expect(['dark', 'light']).toContain(raw);
      expect(themeCodec.decode(raw)).toBe(value);
    }
  });

  it('rejects a stale "true"/"false" payload instead of silently reading dark', () => {
    // A leftover from the old encoder must not be mistaken for a valid value.
    expect(themeCodec.decode('true')).toBe(false);
    expect(themeCodec.decode('false')).toBe(false);
  });
});

describe('localeCodec', () => {
  const codec = localeCodec(['en', 'fr', 'es', 'de']);

  it('round-trips a supported locale', () => {
    expect(codec.decode(codec.encode('fr'))).toBe('fr');
  });

  it('falls back to en for an unsupported locale', () => {
    expect(codec.decode('zz')).toBe('en');
    expect(codec.decode(null)).toBe('en');
  });
});

describe('createStoredValue', () => {
  beforeEach(() => {
    (globalThis.window.localStorage as ReturnType<typeof memoryStorage>).clear();
  });

  it('returns a stable instance per key', () => {
    const key = uniqueKey();
    expect(createStoredValue(key, themeCodec)).toBe(createStoredValue(key, themeCodec));
  });

  it('reads back exactly what set() wrote', () => {
    const store = createStoredValue(uniqueKey(), themeCodec);
    store.set(false);
    expect(store.getSnapshot()).toBe(false);
    store.set(true);
    expect(store.getSnapshot()).toBe(true);
  });

  it('exposes the server default before storage is read', () => {
    const store = createStoredValue(uniqueKey(), themeCodec);
    expect(store.getServerSnapshot()).toBe(true);
  });

  it('notifies subscribers when set() is called', () => {
    const store = createStoredValue(uniqueKey(), themeCodec);
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });
    store.set(false);
    expect(calls).toBe(1);
    unsubscribe();
    store.set(true);
    expect(calls).toBe(1);
  });
});
