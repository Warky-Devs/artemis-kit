/**
 * @fileoverview Type definitions for enhanced I18n module with safe memory cache
 * @version 1.1.0
 */

/**
 * Configuration options for the I18n manager
 */
export type I18nConfig = {
  /** Base URL for the translations API */
  apiUrl?: string;
  /** Maximum size for in-memory cache */
  maxCacheSize?: number;
  /** Time-to-live for cache entries in milliseconds */
  cacheTTL?: number;
};

/**
 * Translation entry structure as stored in the cache
 */
export type CacheEntry = {
  /** The translated string value */
  value: string;
  /** Version number of the translation */
  version: number;
  /** Timestamp when the entry was cached */
  timestamp: number;
};

/**
 * Translation string registration format
 */
export type TranslationString = {
  /** Unique identifier for the translation */
  id: string;
  /** The translated text */
  value: string;
};

/**
 * Server response format for translation requests
 */
export type TranslationResponse = {
  /** The translated text */
  value: string;
  /** Version number of the translation */
  version: number;
};

/**
 * Event payload for translation updates
 */
export type I18nUpdateEvent = CustomEvent<{
  /** Identifier of the updated translation */
  id: string;
  /** New translated value */
  value: string;
}>;

/**
 * Cache statistics interface
 */
export interface CacheStats {
  /** Number of entries in memory cache */
  memorySize: number;
  /** Number of entries in IndexedDB (-1 if unknown) */
  dbSize: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
}

/**
 * Core I18n manager interface
 */
export interface I18nManager {
  /** Configure the I18n manager with options */
  configure(options?: I18nConfig): void;

  /** Register multiple translation strings */
  registerStrings(strings: TranslationString[], version: number): Promise<void>;

  /** Get a translation string asynchronously */
  getString(componentId: string, defaultValue?: string): Promise<string>;

  /** Get a translation string synchronously */
  getStringSync(componentId: string, defaultValue?: string): string;

  /** Clear all cached translations */
  clearCache(): Promise<void>;

  /** Get the current API URL */
  getApiUrl(): string;

  /** Get current cache statistics */
  getCacheStats(): CacheStats;
}

// Export types for external usage
export type GetStringSync = (id: string, defaultValue?: string) => string;
export type GetString = (id: string, defaultValue?: string) => Promise<string>;
