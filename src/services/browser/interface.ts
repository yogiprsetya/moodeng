/**
 * Abstract interface for key-value storage operations
 * Allows swapping different storage implementations (localStorage, sessionStorage, IndexedDB, etc.)
 */
export interface IBrowserDB {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
