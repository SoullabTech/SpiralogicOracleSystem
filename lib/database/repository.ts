/**
 * Database abstraction layer for MAIA Consciousness Lattice
 * Supports multiple database backends with consistent interface
 */

export interface DatabaseConfig {
  type: 'memory' | 'sqlite' | 'postgres' | 'redis' | 'mongodb';
  connectionString?: string;
  options?: Record<string, any>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface WhereClause {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'like' | 'contains';
  value: any;
}

/**
 * Base repository interface for all data access
 */
export interface IRepository<T> {
  create(data: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(where: WhereClause[]): Promise<T | null>;
  findMany(where?: WhereClause[], options?: QueryOptions): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(where?: WhereClause[]): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Abstract base repository with common functionality
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected tableName: string;
  protected primaryKey: string = 'id';

  constructor(tableName: string, primaryKey?: string) {
    this.tableName = tableName;
    if (primaryKey) {
      this.primaryKey = primaryKey;
    }
  }

  abstract create(data: T): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract findOne(where: WhereClause[]): Promise<T | null>;
  abstract findMany(where?: WhereClause[], options?: QueryOptions): Promise<T[]>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(where?: WhereClause[]): Promise<number>;

  async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);
    return record !== null;
  }
}

/**
 * In-memory repository for testing and development
 */
export class InMemoryRepository<T extends { id?: string }> extends BaseRepository<T> {
  private store: Map<string, T> = new Map();
  private idCounter: number = 1;

  async create(data: T): Promise<T> {
    const id = data.id || `${this.tableName}_${this.idCounter++}`;
    const record = { ...data, id };
    this.store.set(id, record);
    return record;
  }

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) || null;
  }

  async findOne(where: WhereClause[]): Promise<T | null> {
    for (const [_, record] of this.store) {
      if (this.matchesWhere(record, where)) {
        return record;
      }
    }
    return null;
  }

  async findMany(where?: WhereClause[], options?: QueryOptions): Promise<T[]> {
    let results: T[] = [];

    for (const [_, record] of this.store) {
      if (!where || where.length === 0 || this.matchesWhere(record, where)) {
        results.push(record);
      }
    }

    // Apply sorting
    if (options?.orderBy) {
      results.sort((a, b) => {
        const aVal = (a as any)[options.orderBy!];
        const bVal = (b as any)[options.orderBy!];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return options.order === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    if (options?.offset !== undefined) {
      results = results.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }

    const updated = { ...existing, ...data, id };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async count(where?: WhereClause[]): Promise<number> {
    if (!where || where.length === 0) {
      return this.store.size;
    }

    let count = 0;
    for (const [_, record] of this.store) {
      if (this.matchesWhere(record, where)) {
        count++;
      }
    }
    return count;
  }

  private matchesWhere(record: T, where: WhereClause[]): boolean {
    for (const clause of where) {
      const value = (record as any)[clause.field];

      switch (clause.operator) {
        case '=':
          if (value !== clause.value) return false;
          break;
        case '!=':
          if (value === clause.value) return false;
          break;
        case '>':
          if (value <= clause.value) return false;
          break;
        case '<':
          if (value >= clause.value) return false;
          break;
        case '>=':
          if (value < clause.value) return false;
          break;
        case '<=':
          if (value > clause.value) return false;
          break;
        case 'in':
          if (!clause.value.includes(value)) return false;
          break;
        case 'like':
        case 'contains':
          if (!String(value).toLowerCase().includes(String(clause.value).toLowerCase())) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  // Testing helper
  clear(): void {
    this.store.clear();
    this.idCounter = 1;
  }
}

/**
 * Repository factory for creating appropriate repository instances
 */
export class RepositoryFactory {
  private static config: DatabaseConfig = { type: 'memory' };
  private static repositories: Map<string, any> = new Map();

  static configure(config: DatabaseConfig): void {
    this.config = config;
    // Clear existing repositories when config changes
    this.repositories.clear();
  }

  static createRepository<T>(tableName: string): IRepository<T> {
    // Check if repository already exists
    if (this.repositories.has(tableName)) {
      return this.repositories.get(tableName);
    }

    let repository: IRepository<T>;

    switch (this.config.type) {
      case 'memory':
        repository = new InMemoryRepository<T>(tableName);
        break;
      case 'sqlite':
        // Would implement SQLiteRepository
        repository = new InMemoryRepository<T>(tableName); // Fallback for now
        break;
      case 'postgres':
        // Would implement PostgresRepository
        repository = new InMemoryRepository<T>(tableName); // Fallback for now
        break;
      case 'redis':
        // Would implement RedisRepository
        repository = new InMemoryRepository<T>(tableName); // Fallback for now
        break;
      case 'mongodb':
        // Would implement MongoRepository
        repository = new InMemoryRepository<T>(tableName); // Fallback for now
        break;
      default:
        repository = new InMemoryRepository<T>(tableName);
    }

    this.repositories.set(tableName, repository);
    return repository;
  }

  static clearAll(): void {
    this.repositories.forEach(repo => {
      if (repo instanceof InMemoryRepository) {
        repo.clear();
      }
    });
  }
}

/**
 * Main database repository class that MAIA components expect
 * This is a convenience wrapper around RepositoryFactory
 */
export class DatabaseRepository {
  private static instance: DatabaseRepository;

  static getInstance(): DatabaseRepository {
    if (!this.instance) {
      this.instance = new DatabaseRepository();
    }
    return this.instance;
  }

  createRepository<T>(tableName: string): IRepository<T> {
    return RepositoryFactory.createRepository<T>(tableName);
  }

  configure(config: DatabaseConfig): void {
    RepositoryFactory.configure(config);
  }

  clearAll(): void {
    RepositoryFactory.clearAll();
  }
}

/**
 * Unit of Work pattern for transaction support
 */
export class UnitOfWork {
  private operations: Array<() => Promise<any>> = [];
  private rollbacks: Array<() => Promise<any>> = [];

  add<T>(operation: () => Promise<T>, rollback?: () => Promise<any>): void {
    this.operations.push(operation);
    if (rollback) {
      this.rollbacks.push(rollback);
    }
  }

  async commit(): Promise<void> {
    const results: any[] = [];

    try {
      for (const operation of this.operations) {
        results.push(await operation());
      }
    } catch (error) {
      // Rollback in reverse order
      for (let i = this.rollbacks.length - 1; i >= 0; i--) {
        try {
          await this.rollbacks[i]();
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }
      throw error;
    } finally {
      this.clear();
    }
  }

  clear(): void {
    this.operations = [];
    this.rollbacks = [];
  }
}