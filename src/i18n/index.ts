/**
 * @fileoverview Internationalization module with IndexedDB caching and server synchronization
 * @version 1.0.0
 */

/**
 * Configuration options for the I18n manager
 */
type I18nConfig = {
    /** Base URL for the translations API */
    apiUrl?: string;
};

/**
 * Translation entry structure as stored in the cache
 */
type CacheEntry = {
    /** The translated string value */
    value: string;
    /** Version number of the translation */
    version: number;
};

/**
 * Translation string registration format
 */
type TranslationString = {
    /** Unique identifier for the translation */
    id: string;
    /** The translated text */
    value: string;
};

/**
 * Server response format for translation requests
 */
type TranslationResponse = {
    /** The translated text */
    value: string;
    /** Version number of the translation */
    version: number;
};

/**
 * Event payload for translation updates
 */
type I18nUpdateEvent = CustomEvent<{
    /** Identifier of the updated translation */
    id: string;
    /** New translated value */
    value: string;
}>;

/**
 * Core I18n manager interface
 */
interface I18nManager {
    configure(options?: I18nConfig): void;
    registerStrings(strings: TranslationString[], version: number): Promise<void>;
    getString(componentId: string, defaultValue?: string): Promise<string>;
    getStringSync(componentId: string, defaultValue?: string): string;
    clearCache(): Promise<void>;
    getApiUrl(): string;
}

const createI18nManager = (): I18nManager => {
    /** Database name for IndexedDB storage */
    const DB_NAME = 'i18n-cache';
    /** Store name for translations within IndexedDB */
    const STORE_NAME = 'translations';
    /** Current version of the translations schema */
    const CURRENT_VERSION = 1;
    /** Default API endpoint if none provided */
    const DEFAULT_API_URL = '/api/translations';

    let db: IDBDatabase | null = null;
    let serverUrl: string = DEFAULT_API_URL;
    const cache = new Map<string, CacheEntry>();
    const pendingUpdates = new Set<string>();
    let initPromise: Promise<void> | null = null;
    let isInitialized = false;

    /**
     * Initializes the IndexedDB database and sets up the object store
     * @returns Promise that resolves when the database is ready
     */
    const initDatabase = async (): Promise<void> => {
        if (isInitialized) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, CURRENT_VERSION);

            request.onerror = () => reject(new Error('Failed to open database'));

            request.onupgradeneeded = (event) => {
                const database = (event.target as IDBOpenDBRequest).result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('version', 'version', { unique: false });
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
     * Loads all translations from IndexedDB into memory cache
     */
    const loadCacheFromDb = async (): Promise<void> => {
        if (!db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            if (!db) throw new Error('Database not initialized');
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = (event) => {
                const entries = (event.target as IDBRequest).result;
                entries.forEach(entry => {
                    cache.set(entry.id, {
                        value: entry.value,
                        version: entry.version
                    });
                });
                resolve();
            };

            request.onerror = () => reject(new Error('Failed to load cache'));
        });
    };

    /**
     * Registers new translations in both IndexedDB and memory cache
     * @param strings - Array of translation strings to register
     * @param version - Version number for these translations
     */
    const registerStrings = async (strings: TranslationString[], version: number): Promise<void> => {
        if (!initPromise) configure();
        await initPromise;
        if (!db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            if (!db) throw new Error('Database not initialized');
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            strings.forEach(string => {
                const entry = {
                    id: string.id,
                    value: string.value,
                    version: version
                };
                store.put(entry);
                cache.set(string.id, {
                    value: string.value,
                    version: version
                });
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error('Failed to register strings'));
        });
    };

    /**
     * Fetches a translation from the server
     * @param componentId - Identifier for the translation to fetch
     * @returns The translated string or null if fetch fails
     */
    const fetchFromServer = async (componentId: string): Promise<string | null> => {
        try {
            const response = await fetch(`${serverUrl}/${componentId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch translation');
            }
            const data: TranslationResponse = await response.json();
            
            await registerStrings([{
                id: componentId,
                value: data.value
            }], data.version);

            return data.value;
        } catch (error) {
            console.error('Error fetching translation:', error);
            return null;
        } finally {
            pendingUpdates.delete(componentId);
        }
    };

    /**
     * Emits a custom event when translations are updated
     * @param id - Identifier of the updated translation
     * @param value - New translated value
     */
    const emitUpdateEvent = (id: string, value: string): void => {
        const event = new CustomEvent('i18n-updated', {
            detail: { id, value }
        }) as I18nUpdateEvent;
        window.dispatchEvent(event);
    };

    /**
     * Synchronously retrieves a translation with background update check
     * @param componentId - Identifier for the translation
     * @param defaultValue - Fallback value if translation not found
     * @returns The translated string or default value
     */
    const getStringSync = (componentId: string, defaultValue = ''): string => {
        if (!isInitialized) {
            console.warn('I18nManager not initialized. Call configure() first or await initialization.');
            return defaultValue;
        }

        const cached = cache.get(componentId);
        if (cached) {
            if (cached.version !== CURRENT_VERSION && !pendingUpdates.has(componentId)) {
                pendingUpdates.add(componentId);
                fetchFromServer(componentId).then(newValue => {
                    if (newValue) {
                        emitUpdateEvent(componentId, newValue);
                    }
                });
            }
            return cached.value;
        }

        if (!pendingUpdates.has(componentId)) {
            pendingUpdates.add(componentId);
            fetchFromServer(componentId).then(newValue => {
                if (newValue) {
                    emitUpdateEvent(componentId, newValue);
                }
            });
        }
        return defaultValue;
    };

    /**
     * Asynchronously retrieves a translation
     * @param componentId - Identifier for the translation
     * @param defaultValue - Fallback value if translation not found
     * @returns Promise resolving to the translated string
     */
    const getString = async (componentId: string, defaultValue = ''): Promise<string> => {
        if (!initPromise) configure();
        await initPromise;
        if (!db) throw new Error('Database not initialized');

        return new Promise( (resolve) => {
            if (!db) throw new Error('Database not initialized');
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(componentId);

            request.onsuccess = async (event) => {
                const result = (event.target as IDBRequest).result;
                
                if (result && result.version === CURRENT_VERSION) {
                    resolve(result.value);
                    return;
                }

                const serverValue = await fetchFromServer(componentId);
                resolve(serverValue || defaultValue);
            };

            request.onerror = () => {
                console.error('Error reading from cache');
                resolve(defaultValue);
            };
        });
    };

    /**
     * Clears all cached translations
     */
    const clearCache = async (): Promise<void> => {
        if (!initPromise) configure();
        await initPromise;
        if (!db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            if (!db) throw new Error('Database not initialized');
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                cache.clear();
                resolve();
            };
            request.onerror = () => reject(new Error('Failed to clear cache'));
        });
    };

    /**
     * Configures the I18n manager
     * @param options - Configuration options
     */
    const configure = (options: I18nConfig = {}): void => {
        if (!isInitialized) {
            serverUrl = options.apiUrl || DEFAULT_API_URL;
            initPromise = initDatabase();
            return;
        }
        
        if (options.apiUrl) {
            serverUrl = options.apiUrl;
            pendingUpdates.clear();
        }
    };

    /**
     * Returns the current API URL
     */
    const getApiUrl = (): string => serverUrl;

    return {
        configure,
        registerStrings,
        getString,
        getStringSync,
        clearCache,
        getApiUrl
    };
};

// Create the singleton instance
const i18nManager = createI18nManager();

// Export the main manager
export const i18n = i18nManager;

// Export shortcut functions
export const _t = i18nManager.getStringSync;
export const _tt = i18nManager.getString;

// Export everything as a namespace
export default {
    ...i18nManager,
    _t,
    _tt
};

// Type declarations for the shortcut functions
export type GetStringSync = typeof i18nManager.getStringSync;
export type GetString = typeof i18nManager.getString;
