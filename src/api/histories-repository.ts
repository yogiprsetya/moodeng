import type { History } from "~/types/history";
import { DBDriver, STORES } from "./db-driver";

export class HistoriesRepository {
  private database: DBDriver;

  constructor(database: DBDriver) {
    this.database = database;
  }

  async create(history: History): Promise<History> {
    const db = await this.database.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.HISTORIES], "readwrite");
      const store = transaction.objectStore(STORES.HISTORIES);
      const request = store.add(history);

      request.onsuccess = () => resolve(history);
      request.onerror = () => reject(new Error("Failed to create history"));
    });
  }

  async getRecent(limit = 100): Promise<History[]> {
    const db = await this.database.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.HISTORIES], "readonly");
      const store = transaction.objectStore(STORES.HISTORIES);
      const index = store.index("createdAt");

      const results: History[] = [];
      const request = index.openCursor(null, "prev");

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || results.length >= limit) {
          resolve(results);
          return;
        }
        results.push(cursor.value as History);
        cursor.continue();
      };

      request.onerror = () => reject(new Error("Failed to get histories"));
    });
  }

  async getByNoteId(noteId: string, limit = 100): Promise<History[]> {
    const db = await this.database.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.HISTORIES], "readonly");
      const store = transaction.objectStore(STORES.HISTORIES);
      const index = store.index("noteId");

      const results: History[] = [];
      const request = index.openCursor(IDBKeyRange.only(noteId), "prev");

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || results.length >= limit) {
          // cursor order here depends on insertion order, so sort by createdAt desc for stable UI
          results.sort((a, b) => b.createdAt - a.createdAt);
          resolve(results);
          return;
        }
        results.push(cursor.value as History);
        cursor.continue();
      };

      request.onerror = () =>
        reject(new Error("Failed to get histories by noteId"));
    });
  }
}
