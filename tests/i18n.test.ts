import { describe, expect, it } from 'vitest';
import { fill, LOCALES, translations, type Locale } from '../src/lib/i18n';

describe('translations', () => {
  const keys = Object.keys(translations.en) as Array<keyof (typeof translations)['en']>;

  it('exposes exactly the four supported locales', () => {
    expect(LOCALES).toEqual(['en', 'fr', 'es', 'de']);
    expect(Object.keys(translations).sort()).toEqual([...LOCALES].sort());
  });

  it.each(LOCALES)('defines every key for %s', (locale) => {
    expect(Object.keys(translations[locale]).sort()).toEqual([...keys].sort());
  });

  it.each(LOCALES)('has no empty strings for %s', (locale) => {
    const empty = keys.filter((key) => translations[locale][key].trim() === '');
    expect(empty).toEqual([]);
  });

  it.each(LOCALES)('keeps placeholders consistent across %s', (locale) => {
    const used = keys
      .map((key) => translations[locale][key])
      .filter((value) => value.includes('{'));
    // The same set of placeholders must exist in every locale, otherwise
    // fill() silently leaves a raw {token} in the UI.
    const expected = keys
      .map((key) => translations.en[key])
      .filter((value) => value.includes('{'))
      .map((value) => (value.match(/\{(\w+)\}/g) ?? []).sort().join(','))
      .sort();
    expect(used.map((value) => (value.match(/\{(\w+)\}/g) ?? []).sort().join(',')).sort()).toEqual(
      expected,
    );
  });
});

describe('fill', () => {
  it('substitutes known tokens', () => {
    expect(fill('Copy {name}', { name: 'Anthropic' })).toBe('Copy Anthropic');
  });

  it('substitutes numbers', () => {
    expect(fill('{count} secrets', { count: 3 })).toBe('3 secrets');
  });

  it('leaves unknown tokens untouched rather than printing undefined', () => {
    expect(fill('Copy {name}', {})).toBe('Copy {name}');
  });

  it('substitutes every occurrence', () => {
    expect(fill('{a} and {a}', { a: 'x' })).toBe('x and x');
  });
});

describe('locale validation', () => {
  it('rejects an unknown locale string', () => {
    const saved = 'zz' as Locale;
    expect(LOCALES.includes(saved)).toBe(false);
  });
});
