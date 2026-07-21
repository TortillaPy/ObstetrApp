export interface IRepository<T, K = string> {
  getAll(): Promise<T[]>;
  getById(id: K): Promise<T | null>;
  save(entity: T): Promise<void>;
  update(id: K, entity: Partial<T>): Promise<void>;
  delete(id: K): Promise<void>;
}
