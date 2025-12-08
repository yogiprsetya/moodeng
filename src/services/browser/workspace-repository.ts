import type { Workspace } from "~/types/workspace";
import { DBDriver, STORES } from "./db-driver";

/**
 * Repository for workspace operations
 */
export class WorkspaceRepository {
  private database: DBDriver;

  constructor(database: DBDriver) {
    this.database = database;
  }

  /**
   * Get workspace settings
   */
  async get(): Promise<Workspace | null> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.WORKSPACE], "readonly");
      const store = transaction.objectStore(STORES.WORKSPACE);
      const request = store.get("workspace");

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error("Failed to get workspace"));
      };
    });
  }

  /**
   * Create or update workspace settings
   */
  async save(workspace: Workspace): Promise<void> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.WORKSPACE], "readwrite");
      const store = transaction.objectStore(STORES.WORKSPACE);
      const request = store.put(workspace, "workspace");

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to save workspace"));
      };
    });
  }

  /**
   * Delete workspace settings
   */
  async delete(): Promise<void> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.WORKSPACE], "readwrite");
      const store = transaction.objectStore(STORES.WORKSPACE);
      const request = store.delete("workspace");

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to delete workspace"));
      };
    });
  }
}
