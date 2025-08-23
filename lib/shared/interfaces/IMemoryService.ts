export interface IMemoryService {
  read<T = unknown>(key: string): Promise<T | null>;
  write<T = unknown>(key: string, value: T): Promise<void>;
  delete?(key: string): Promise<void>;
  exists?(key: string): Promise<boolean>;
}