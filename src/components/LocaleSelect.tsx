'use client';

import React from 'react';
import { LOCALES, type Locale, type Translations } from '@/lib/i18n';

interface LocaleSelectProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
  t: Translations;
}

export const LocaleSelect: React.FC<LocaleSelectProps> = ({ locale, onChange, t }) => {
  return (
    <label className="btn-icon relative" title={t.language}>
      <span
        aria-hidden="true"
        className="pointer-events-none font-mono text-[11px] font-medium tracking-wide text-ink-2"
      >
        {locale.toUpperCase()}
      </span>
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value as Locale)}
        aria-label={t.language}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
};
