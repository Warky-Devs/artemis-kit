// buffer.ts
import { ActiveRecord, BufferOptions } from './types';
import { NestedQueue } from './queue';

export class ActiveRecordBuffer<T extends object> {
  private buffer: Map<string | number, ActiveRecord<T>>;
  private queue: NestedQueue<T>;
  private autoSaveTimer?: any;
  private options: Required<BufferOptions>;

  constructor(queue: NestedQueue<T>, options: BufferOptions = {}) {
    this.queue = queue;
    this.buffer = new Map();
    this.options = {
      autoSave: options.autoSave ?? true,
      bufferSize: options.bufferSize ?? 100,
      flushInterval: options.flushInterval ?? 5000
    };

    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }

  private startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }

  private stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  private getRecordId(record: T): string | number {
    if ('id' in record) return record['id'] as string | number;
    if ('key' in record) return record['key'] as string;
    throw new Error('Record must have an id or key property');
  }

  async load(record: T): Promise<ActiveRecord<T>> {
    const id = this.getRecordId(record);
    
    if (this.buffer.has(id)) {
      return this.buffer.get(id)!;
    }

    const activeRecord: ActiveRecord<T> = {
      data: { ...record },
      id,
      isDirty: false,
      isNew: false,
      changes: {},
      originalData: { ...record }
    };

    this.buffer.set(id, activeRecord);
    
    if (this.buffer.size > this.options.bufferSize) {
      await this.flush();
    }

    return activeRecord;
  }

  create(data: T): ActiveRecord<T> {
    const id = this.getRecordId(data);
    
    const activeRecord: ActiveRecord<T> = {
      data: { ...data } as any,
      id,
      isDirty: true,
      isNew: true,
      changes: { ...data } as any,
      originalData: { }
    } as ActiveRecord<T>;

    this.buffer.set(id, activeRecord);
    return activeRecord;
  }

  update(id: string | number, changes: Partial<T>): ActiveRecord<T> {
    const record = this.buffer.get(id);
    if (!record) {
      throw new Error(`Record with id ${id} not found in buffer`);
    }

    record.isDirty = true;
    record.data = { ...record.data, ...changes };
    record.changes = { ...record.changes, ...changes };

    return record;
  }

  async delete(id: string | number) {
    const record = this.buffer.get(id);
    if (record) {
      await this.queue.remove(String(id));
      this.buffer.delete(id);
    }
  }

  get(id: string | number): ActiveRecord<T> | undefined {
    return this.buffer.get(id);
  }

  hasChanges(id: string | number): boolean {
    const record = this.buffer.get(id);
    return record ? record.isDirty : false;
  }

  getDirtyRecords(): ActiveRecord<T>[] {
    return Array.from(this.buffer.values()).filter(record => record.isDirty);
  }

  getAll(): ActiveRecord<T>[] {
    return Array.from(this.buffer.values());
  }

  async flush(): Promise<void> {
    const dirtyRecords = this.getDirtyRecords();
    
    for (const record of dirtyRecords) {
      if (record.isNew) {
        await this.queue.add(record.data);
      } else {
        await this.queue.update(String(record.id), record.changes);
      }

      record.isDirty = false;
      record.isNew = false;
      record.changes = {};
      record.originalData = { ...record.data };
    }

    this.buffer.clear();
  }

  rollback(id: string | number) {
    const record = this.buffer.get(id);
    if (record) {
      record.data = { ...record.originalData };
      record.isDirty = false;
      record.changes = {};
    }
  }

  rollbackAll() {
    for (const [id] of this.buffer) {
      this.rollback(id);
    }
  }

  clear() {
    this.buffer.clear();
  }

  dispose() {
    this.stopAutoSave();
    this.clear();
  }
}