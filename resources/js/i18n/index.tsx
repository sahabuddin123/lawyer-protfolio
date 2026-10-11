import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Locale } from '@/types';
import { TranslationDictionary } from './types';
import { en } from './en';
import { bn } from './bn';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationDictionary;
  formatNumber: (value: number | string) => string;
  formatDate: (dateStr: string) => string;
}

const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  bn,
};

const BENGALI_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('nijam_locale') as Locale | null;
      if (saved === 'en' || saved === 'bn') {
        return saved;
      }
    } catch {
      // ignore storage access restrictions
    }
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('nijam_locale', newLocale);
    } catch {
      // ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  }, [locale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
  }, [locale]);

  const formatNumber = useCallback(
    (value: number | string): string => {
      const str = String(value);
      if (locale === 'en') return str;
      return str.replace(/[0-9]/g, (digit) => BENGALI_NUMERALS[parseInt(digit, 10)]);
    },
    [locale]
  );

  const formatDate = useCallback(
    (dateStr: string): string => {
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        const formatted = date.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', options);
        return formatted;
      } catch {
        return dateStr;
      }
    },
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: dictionaries[locale],
      formatNumber,
      formatDate,
    }),
    [locale, setLocale, toggleLocale, formatNumber, formatDate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
