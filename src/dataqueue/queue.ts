// queue.ts
import {
  QueueData,
  QueueOptions,
  QueueAction,

  SortOptions,
  BufferOptions,
  Middleware,
  PersistenceAdapter,
} from "./types";
import { ActiveRecordBuffer } from "./buffer";
import { QueueUtils } from "./utils";

export class NestedQueue<T extends object> {
  protected data: QueueData<T>;
  private listeners: Set<(data: QueueData<T>) => void>;
  private middleware: Middleware<T>[];
  private persistence?: PersistenceAdapter<T>;
  private initialized: Promise<void>;

  constructor(initialData: QueueData<T> = [], options: QueueOptions<T> = {}) {
    this.data = [...initialData];
    this.listeners = new Set();
    this.middleware = options.middleware || [];
    this.persistence = options.persistence;

    this.initialized =
      options.autoload && this.persistence
        ? this.loadFromPersistence()
        : Promise.resolve();
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((callback) => callback(this.data));
  }

  private getNestedValue(obj: any, path: string | string[]) {
    const keys = Array.isArray(path) ? path : path.split(".");
    return keys.reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      current[key] = current[key] || {};
      return current[key];
    }, obj);
    target[lastKey] = value;
    return obj;
  }

  private async executeAction(action: QueueAction<T>): Promise<void> {
    // Run through beforeAction middleware
    let currentAction = action;
    for (const m of this.middleware) {
      if (m.beforeAction) {
        currentAction = m.beforeAction(currentAction) || currentAction;
        if (!currentAction) return; // Action cancelled by middleware
      }
    }

    // Execute the action
    switch (currentAction.type) {
      case "add":
        this.executeAdd(currentAction.payload, currentAction.path);
        break;
      case "remove":
        this.executeRemove(currentAction.path!);
        break;
      case "update":
        this.executeUpdate(currentAction.path!, currentAction.payload);
        break;
      case "sort":
        this.executeSort(
          currentAction.payload.key,
          currentAction.payload.options
        );
        break;
      case "clear":
        this.executeClear();
        break;
    }

    // Run through afterAction middleware
    for (const m of this.middleware) {
      if (m.afterAction) {
        m.afterAction(currentAction, this.data);
      }
    }

    // Persist changes if enabled
    if (this.persistence) {
      await this.persistence.save(this.data);
    }

    // Notify listeners
    this.notify();
  }

  private executeAdd(item: T, path: string = "") {
    this.data = [...this.data];

    if (!path) {
      this.data.push(item);
      return;
    }

    const target = this.getNestedValue(this.data, path);
    if (Array.isArray(target)) {
      target.push(item);
    }
  }

  private executeRemove(path: string) {
    const pathParts = path.split(".");
    const index = pathParts.pop()!;
    const parentPath = pathParts.join(".");

    this.data = [...this.data];
    const target = parentPath
      ? this.getNestedValue(this.data, parentPath)
      : this.data;

    if (Array.isArray(target)) {
      target.splice(Number(index), 1);
    }
  }

  private executeUpdate(path: string, value: Partial<T>) {
    this.data = [...this.data];
    const existing = this.getNestedValue(this.data, path);

    if (existing) {
      this.setNestedValue(this.data, path, { ...existing, ...value });
    }
  }

  private executeSort(key: keyof T | string[], options: SortOptions<T> = {}) {
    const {
      deep = true,
      maxDepth = Infinity,
      path = "",
      direction = "asc",
      sortFn,
    } = options;

    const sortArray = (array: any[], depth: number = 0): void => {
      if (sortFn) {
        array.sort((a, b) => sortFn(a, b));
      } else {
        array.sort((a, b) => {
          const aValue = Array.isArray(key)
            ? this.getNestedValue(a, key)
            : a[key];
          const bValue = Array.isArray(key)
            ? this.getNestedValue(b, key)
            : b[key];

          return QueueUtils.compareValues(aValue, bValue, direction);
        });
      }

      if (deep && depth < maxDepth) {
        array.forEach((item) => {
          Object.values(item).forEach((value) => {
            if (Array.isArray(value)) {
              sortArray(value, depth + 1);
            }
          });
        });
      }
    };

    this.data = [...this.data];

    if (path) {
      const target = this.getNestedValue(this.data, path);
      if (Array.isArray(target)) {
        sortArray(target);
      }
    } else {
      sortArray(this.data);
    }
  }

  private executeClear() {
    this.data = [];
  }

  // ... Core action execution methods ...
  // (Previously defined methods: executeAction, executeAdd, executeRemove, etc.)

  // Public API methods
  async add(item: T, path: string = "") {
    await this.initialized;
    return this.executeAction({
      type: "add",
      payload: item,
      path,
    });
  }

  async remove(path: string) {
    await this.initialized;
    return this.executeAction({
      type: "remove",
      path,
    });
  }

  async update(path: string, value: Partial<T>) {
    await this.initialized;
    return this.executeAction({
      type: "update",
      payload: value,
      path,
    });
  }

  get(path: string) {
    return this.getNestedValue(this.data, path);
  }

  getAll() {
    return this.data;
  }

  // ... Search and filter methods ...
  // (Previously defined methods: search, filter, findOne, sort)

  async clear() {
    await this.initialized;
    return this.executeAction({
      type: "clear",
    });
  }

  private async loadFromPersistence(): Promise<void> {
    if (!this.persistence) return;

    try {
      const persistedData = await this.persistence.load();
      if (persistedData) {
        this.data = persistedData;
        this.notify();
      }
    } catch (error) {
      console.error("Failed to load persisted data:", error);
    }
  }

  async clearPersistence(): Promise<void> {
    if (this.persistence) {
      await this.persistence.clear();
    }
  }
}

// Enhanced queue with buffer support
export class EnhancedNestedQueue<T extends object> extends NestedQueue<T> {
  private activeRecordBuffer: ActiveRecordBuffer<T>;

  constructor(
    initialData: T[] = [],
    options: QueueOptions<T> = {},
    bufferOptions: BufferOptions = {}
  ) {
    super(initialData, options);
    this.activeRecordBuffer = new ActiveRecordBuffer<T>(this, bufferOptions);
  }

  getBuffer(): ActiveRecordBuffer<T> {
    return this.activeRecordBuffer;
  }
}

export default EnhancedNestedQueue;
