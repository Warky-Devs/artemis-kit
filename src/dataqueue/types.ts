
export type QueueData<T> = T[];

export interface SearchOptions {
  exact?: boolean;
  caseSensitive?: boolean;
  deep?: boolean;
  paths?: string[];
}

export interface FilterOptions {
  deep?: boolean;
  maxDepth?: number;
}

export interface SortOptions<T> {
  deep?: boolean;
  maxDepth?: number;
  path?: string;
  direction?: 'asc' | 'desc';
  sortFn?: (a: T, b: T) => number;
}

export type QueueAction<T> = {
  type: 'add' | 'remove' | 'update' | 'sort' | 'clear';
  payload?: T | any;
  path?: string;
};

export interface Middleware<T> {
  beforeAction?: (action: QueueAction<T>) => QueueAction<T> | null;
  afterAction?: (action: QueueAction<T>, state: QueueData<T>) => void;
}

export interface PersistenceAdapter<T> {
  save: (data: QueueData<T>) => Promise<void>;
  load: () => Promise<QueueData<T> | null>;
  clear: () => Promise<void>;
}

export interface QueueOptions<T> {
  persistence?: PersistenceAdapter<T>;
  middleware?: Middleware<T>[];
  autoload?: boolean;
}

export interface BufferOptions {
  autoSave?: boolean;
  bufferSize?: number;
  flushInterval?: number;
}

export interface ActiveRecord<T> {
  data: T;
  id: string | number;
  isDirty: boolean;
  isNew: boolean;
  changes: Partial<T>;
  originalData: T;
}

export interface QueueOperations<T> {
  add: (item: T, path?: string) => Promise<void>;
  remove: (path: string) => Promise<void>;
  update: (path: string, value: Partial<T>) => Promise<void>;
  get: (path: string) => any;
  getAll: () => T[];
  search: (query: string | object, options?: SearchOptions) => T[];
  filter: (predicate: (item: T) => boolean, options?: FilterOptions) => T[];
  findOne: (predicate: (item: T) => boolean) => T | undefined;
  sort: (key: keyof T | string[], options?: SortOptions<T>) => Promise<void>;
  clear: () => Promise<void>;
}