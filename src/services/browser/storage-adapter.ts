import type { IBrowserDB } from "./interface";

/**
 * LocalStorage implementation of StorageAdapter
 */
export class LocalStorageAdapter implements IBrowserDB {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
