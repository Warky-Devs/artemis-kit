import {
  I18nConfig,
  CacheEntry,
  TranslationString,
  TranslationResponse,
  I18nUpdateEvent,
  CacheStats,
  I18nManager,
} from "./types";

/**
 * Creates an instance of the I18n manager with safe memory caching
 */
const createI18nManager = (): I18nManager => {
  /** Database name for IndexedDB storage */
  const DB_NAME = "i18n-cache";
  /** Store name for translations within IndexedDB */
  const STORE_NAME = "translations";
  /** Current version of the translations schema */
  const CURRENT_VERSION = 1;
  /** Default API endpoint if none provided */
  const DEFAULT_API_URL = "/api/translations";
  /** Default maximum cache size */
  const DEFAULT_MAX_CACHE_SIZE = 1000;
  /** Default TTL for cache entries (24 hours) */
  const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000;

  // Core state
  let db: IDBDatabase | null = null;
  let serverUrl: string = DEFAULT_API_URL;
  let maxCacheSize: number = DEFAULT_MAX_CACHE_SIZE;
  let cacheTTL: number = DEFAULT_CACHE_TTL;

  // Cache management
  const cache = new Map<string, CacheEntry>();
  const lruQueue: string[] = [];
  const stats = {
    hits: 0,
    misses: 0,
  };

  // Update tracking
  const pendingUpdates = new Set<string>();
  let initPromise: Promise<void> | null = null;
  let isInitialized = false;

  /**
   * Checks if IndexedDB is available
   */
  const isIndexedDBAvailable = (): boolean => {
    try {
      return typeof indexedDB !== "undefined" && indexedDB !== null;
    } catch {
      return false;
    }
  };

  /**
   * Updates LRU tracking for cache entry
   */
  const updateLRU = (id: string): void => {
    const index = lruQueue.indexOf(id);
    if (index > -1) {
      lruQueue.splice(index, 1);
    }
    lruQueue.push(id);
  };

  /**
   * Evicts oldest entries when cache exceeds max size
   */
  const evictCacheEntries = (): void => {
    while (cache.size > maxCacheSize && lruQueue.length > 0) {
      const oldestId = lruQueue.shift();
      if (oldestId) {
        cache.delete(oldestId);
      }
    }
  };

  /**
   * Checks if a cache entry is still valid
   */
  const isCacheEntryValid = (entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp < cacheTTL;
  };

  /**
   * Safely retrieves a value from memory cache
   */
  const getFromMemoryCache = (id: string): CacheEntry | null => {
    const entry = cache.get(id);
    if (!entry) {
      stats.misses++;
      return null;
    }

    if (!isCacheEntryValid(entry)) {
      cache.delete(id);
      const index = lruQueue.indexOf(id);
      if (index > -1) {
        lruQueue.splice(index, 1);
      }
      stats.misses++;
      return null;
    }

    stats.hits++;
    updateLRU(id);
    return entry;
  };

  /**
   * Safely stores a value in memory cache
   */
  const setInMemoryCache = (
    id: string,
    value: string,
    version: number
  ): void => {
    const entry: CacheEntry = {
      value,
      version,
      timestamp: Date.now(),
    };

    cache.set(id, entry);
    updateLRU(id);
    evictCacheEntries();
  };

  /**
   * Initializes the system with IndexedDB if available
   */
  const initDatabase = async (): Promise<void> => {
    if (isInitialized) return;

    if (!isIndexedDBAvailable()) {
      console.warn("IndexedDB not available, falling back to memory-only mode");
      isInitialized = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, CURRENT_VERSION);

      request.onerror = () => {
        console.warn(
          "Failed to open IndexedDB, falling back to memory-only mode"
        );
        isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
          store.createIndex("version", "version", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        db = (event.target as IDBOpenDBRequest).result;
        await loadCacheFromDb();
        isInitialized = true;
        resolve();
      };
    });
  };

  /**
   * Loads valid translations from IndexedDB
   */
  const loadCacheFromDb = async (): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const entries = (event.target as IDBRequest).result;
        entries.forEach((entry) => {
          if (isCacheEntryValid(entry)) {
            setInMemoryCache(entry.id, entry.value, entry.version);
          } else {
            // Clean up expired entries
            const deleteTransaction = db!.transaction(
              [STORE_NAME],
              "readwrite"
            );
            const deleteStore = deleteTransaction.objectStore(STORE_NAME);
            deleteStore.delete(entry.id);
          }
        });
        resolve();
      };

      request.onerror = () => {
        console.warn("Failed to load cache from IndexedDB");
        resolve();
      };
    });
  };

  const fetchFromServer = async (
    componentId: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(`${serverUrl}/${componentId}`);
      if (!response.ok) throw new Error("Failed to fetch translation");

      const data: TranslationResponse = await response.json();
      await registerStrings(
        [
          {
            id: componentId,
            value: data.value,
          },
        ],
        data.version
      );

      return data.value;
    } catch (error) {
      console.error("Error fetching translation:", error);
      return null;
    } finally {
      pendingUpdates.delete(componentId);
    }
  };

  /**
   * Emits update event
   */
  const emitUpdateEvent = (id: string, value: string): void => {
    const event = new CustomEvent("i18n-updated", {
      detail: { id, value },
    }) as I18nUpdateEvent;
    window.dispatchEvent(event);
  };

  /**
   * Configures the I18n manager
   */
  const configure = (options: I18nConfig = {}): void => {
    if (!isInitialized) {
      serverUrl = options.apiUrl || DEFAULT_API_URL;
      maxCacheSize = options.maxCacheSize || DEFAULT_MAX_CACHE_SIZE;
      cacheTTL = options.cacheTTL || DEFAULT_CACHE_TTL;
      initPromise = initDatabase();
      return;
    }

    // Update existing configuration
    if (options.apiUrl) {
      serverUrl = options.apiUrl;
      pendingUpdates.clear(); // Clear pending updates as API endpoint changed
    }
    if (options.maxCacheSize) {
      maxCacheSize = options.maxCacheSize;
      evictCacheEntries(); // Immediately apply new cache size limit
    }
    if (options.cacheTTL) {
      cacheTTL = options.cacheTTL;
      // Optionally clean up expired entries based on new TTL
      for (const [id, entry] of cache.entries()) {
        if (!isCacheEntryValid(entry)) {
          cache.delete(id);
          const index = lruQueue.indexOf(id);
          if (index > -1) {
            lruQueue.splice(index, 1);
          }
        }
      }
    }
  };

  /**
   * Registers new translations in both stores
   */
  const registerStrings = async (
    strings: TranslationString[],
    version: number
  ): Promise<void> => {
    if (!initPromise) configure();
    await initPromise;

    // Always update memory cache first
    strings.forEach((string) => {
      setInMemoryCache(string.id, string.value, version);
    });

    // If no IndexedDB, we're done
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      strings.forEach((string) => {
        const entry = {
          id: string.id,
          value: string.value,
          version,
          timestamp: Date.now(),
        };
        store.put(entry);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        console.warn("Failed to persist translations to IndexedDB");
        resolve(); // Still resolve as memory cache is updated
      };
    });
  };

  /**
   * Gets translation synchronously with optional update check
   */
  const getStringSync = (componentId: string, defaultValue = ""): string => {
    if (!isInitialized) {
      console.warn("I18nManager not initialized. Call configure() first.");
      return defaultValue;
    }

    const cached = getFromMemoryCache(componentId);
    if (cached) {
      // Check for updates if version mismatch
      if (
        cached.version !== CURRENT_VERSION &&
        !pendingUpdates.has(componentId)
      ) {
        pendingUpdates.add(componentId);
        fetchFromServer(componentId).then((newValue) => {
          if (newValue) emitUpdateEvent(componentId, newValue);
        });
      }
      return cached.value;
    }

    // Schedule background fetch if not already pending
    if (!pendingUpdates.has(componentId)) {
      pendingUpdates.add(componentId);
      fetchFromServer(componentId).then((newValue) => {
        if (newValue) emitUpdateEvent(componentId, newValue);
      });
    }
    return defaultValue;
  };

  /**
   * Gets translation asynchronously with full update cycle
   */
  const getString = async (
    componentId: string,
    defaultValue = ""
  ): Promise<string> => {
    if (!initPromise) configure();
    await initPromise;

    // Check memory cache first
    const cached = getFromMemoryCache(componentId);
    if (cached && cached.version === CURRENT_VERSION) {
      return cached.value;
    }

    // If no IndexedDB, try server directly
    if (!db) {
      const serverValue = await fetchFromServer(componentId);
      return serverValue || defaultValue;
    }

    // Try IndexedDB, then fall back to server
    return new Promise((resolve) => {
      const transaction = db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(componentId);

      request.onsuccess = async (event) => {
        const result = (event.target as IDBRequest).result;

        if (
          result &&
          result.version === CURRENT_VERSION &&
          isCacheEntryValid(result)
        ) {
          setInMemoryCache(result.id, result.value, result.version);
          resolve(result.value);
          return;
        }

        const serverValue = await fetchFromServer(componentId);
        resolve(serverValue || defaultValue);
      };

      request.onerror = async () => {
        console.warn("Error reading from IndexedDB cache");
        const serverValue = await fetchFromServer(componentId);
        resolve(serverValue || defaultValue);
      };
    });
  };

  /**
   * Clears all caches
   */
  const clearCache = async (): Promise<void> => {
    if (!initPromise) configure();
    await initPromise;

    // Clear memory cache
    cache.clear();
    lruQueue.length = 0;
    stats.hits = 0;
    stats.misses = 0;

    // If no IndexedDB, we're done
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn("Failed to clear IndexedDB cache");
        resolve(); // Still resolve as memory cache is cleared
      };
    });
  };

  /**
   * Gets current API URL
   */
  const getApiUrl = (): string => serverUrl;

  /**
   * Gets cache statistics
   */
  const getCacheStats = (): CacheStats => ({
    memorySize: cache.size,
    dbSize: db ? -1 : 0, // -1 indicates DB exists but size unknown
    hits: stats.hits,
    misses: stats.misses,
  });

  // Complete the manager interface
  return {
    configure,
    registerStrings,
    getString,
    getStringSync,
    clearCache,
    getApiUrl,
    getCacheStats,
  };
};

// Export everything
export const i18n = createI18nManager();
export const _t = i18n.getStringSync;
export const _tt = i18n.getString;
export default {
  ...i18n,
  _t,
  _tt,
};
