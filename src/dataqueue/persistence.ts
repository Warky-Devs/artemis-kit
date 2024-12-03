
import type { PersistenceAdapter, QueueData } from './types';

export class LocalStoragePersistence<T> implements PersistenceAdapter<T> {
  constructor(private key: string) {
    this.key = key;
  }

  async save(data: QueueData<T>): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async load(): Promise<QueueData<T> | null> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : null;
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.key);
  }
}

export class IndexedDBPersistence<T> implements PersistenceAdapter<T> {
  private dbName: string;
  private storeName: string;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async save(data: QueueData<T>): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data, 'queueData');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async load(): Promise<QueueData<T> | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('queueData');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export class InMemoryPersistence<T> implements PersistenceAdapter<T> {
  private data: QueueData<T> | null = null;

  async save(data: QueueData<T>): Promise<void> {
    this.data = [...data];
  }

  async load(): Promise<QueueData<T> | null> {
    return this.data ? [...this.data] : null;
  }

  async clear(): Promise<void> {
    this.data = null;
  }
}