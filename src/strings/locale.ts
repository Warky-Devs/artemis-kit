/**
 * Comprehensive localization utilities for handling text, numbers, dates, and currencies
 */

// type LocaleConfig = {
//     dateFormat: string;
//     numberFormat: {
//       decimal: string;
//       thousands: string;
//       precision: number;
//     };
//     currency: {
//       symbol: string;
//       position: 'prefix' | 'suffix';
//     };
//     pluralRules?: Intl.PluralRules;
//   };

// const defaultConfig: LocaleConfig = {
//   dateFormat: 'YYYY-MM-DD',
//   numberFormat: {
//     decimal: '.',
//     thousands: ',',
//     precision: 2
//   },
//   currency: {
//     symbol: '$',
//     position: 'prefix'
//   }
// };
/**
 * Formats a number according to locale settings
 */
export const formatNumber = (
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    ...options,
    useGrouping: true,
  });
  return formatter.format(value).replace(/\u202f/g, " ");
};

/**
 * Formats currency according to locale settings
 */
export const formatCurrency = (
  value: number,
  locale: string,
  currency: string
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });
  return formatter.format(value).replace(/\u202f/g, " ");
};

/**
 * Formats a date according to locale settings
 */
export const formatDate = (
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Formats relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string
): string => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return rtf.format(value, unit);
};

/**
 * Handles plural forms based on locale rules
 */
export const getPlural = (
  count: number,
  locale: string,
  forms: { [key: string]: string }
): string => {
  const pluralRules = new Intl.PluralRules(locale);
  const rule = pluralRules.select(count);
  return forms[rule] || forms["other"];
};

/**
 * Formats lists according to locale conventions
 */
export const formatList = (
  items: string[],
  locale: string,
  type: "conjunction" | "disjunction" = "conjunction"
): string => {
  return new Intl.ListFormat(locale, { type }).format(items);
};

/**
 * Compares strings according to locale rules
 */
export const compareStrings = (
  str1: string,
  str2: string,
  locale: string
): number => {
  return new Intl.Collator(locale).compare(str1, str2);
};

/**
 * Formats percentages according to locale
 */
export const formatPercent = (
  value: number,
  locale: string,
  decimals: number = 0
): string => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formats units according to locale
 */
export const formatUnit = (
  value: number,
  unit: string,
  locale: string
): string => {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: unit,
  }).format(value);
};

/**
 * Converts number words to digits based on locale
 */
export const parseNumberWords = (
  text: string,
  locale: string
): number | null => {
  const numberWords: { [locale: string]: { [key: string]: number } } = {
    "en-US": {
      zero: 0,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
    },
    "af-ZA": {
      nul: 0,
      een: 1,
      twee: 2,
      drie: 3,
      vier: 4,
      vyf: 5,
      ses: 6,
      sewe: 7,
      agt: 8,
      nege: 9,
    },
  };

  const localeWords = numberWords[locale] || numberWords["en-US"];
  const normalizedText = text.toLowerCase().trim();

  for (const [word, number] of Object.entries(localeWords)) {
    if (normalizedText === word) {
      return number;
    }
  }
  return null;
};

/**
 * Handles bi-directional text
 */
export const handleBiDi = (text: string): string => {
  return `\u202A${text}\u202C`;
};
