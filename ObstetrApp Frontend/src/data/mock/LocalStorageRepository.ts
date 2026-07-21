import { IRepository } from '../repositories/IRepository';

// Simula un breve retraso de red
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class LocalStorageRepository<T extends { [key: string]: any }> implements IRepository<T> {
  protected storageKey: string;
  protected idField: string;

  constructor(storageKey: string, idField: string) {
    this.storageKey = storageKey;
    this.idField = idField;
  }

  protected getItems(): T[] {
    const itemStr = localStorage.getItem(this.storageKey);
    return itemStr ? JSON.parse(itemStr) : [];
  }

  protected setItems(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async getAll(): Promise<T[]> {
    await delay(300);
    return this.getItems();
  }

  async getById(id: string): Promise<T | null> {
    await delay(100);
    const items = this.getItems();
    return items.find((item) => item[this.idField] === id) || null;
  }

  async save(entity: T): Promise<void> {
    await delay(200);
    const items = this.getItems();
    // Check if exists
    const index = items.findIndex((item) => item[this.idField] === entity[this.idField]);
    if (index > -1) {
      items[index] = entity;
    } else {
      items.push(entity);
    }
    this.setItems(items);
  }

  async update(id: string, partialEntity: Partial<T>): Promise<void> {
    await delay(200);
    const items = this.getItems();
    const index = items.findIndex((item) => item[this.idField] === id);
    if (index > -1) {
      items[index] = { ...items[index], ...partialEntity };
      this.setItems(items);
    }
  }

  async delete(id: string): Promise<void> {
    await delay(200);
    const items = this.getItems();
    this.setItems(items.filter((item) => item[this.idField] !== id));
  }
}
