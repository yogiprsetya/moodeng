import { DBDriver, STORES } from "./db-driver";

/**
 * Database maintenance operations
 */
export class DBMaintenance {
  private database: DBDriver;

  constructor(database: DBDriver) {
    this.database = database;
  }

  /**
   * Clear all data from the database
   */
  async clearAll(): Promise<void> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [STORES.WORKSPACE, STORES.NOTES, STORES.COLLECTIONS, STORES.HISTORIES],
        "readwrite"
      );

      const workspaceStore = transaction.objectStore(STORES.WORKSPACE);
      const notesStore = transaction.objectStore(STORES.NOTES);
      const collectionsStore = transaction.objectStore(STORES.COLLECTIONS);
      const historiesStore = transaction.objectStore(STORES.HISTORIES);

      let completed = 0;
      const total = 4;

      const checkComplete = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };

      workspaceStore.clear().onsuccess = checkComplete;
      notesStore.clear().onsuccess = checkComplete;
      collectionsStore.clear().onsuccess = checkComplete;
      historiesStore.clear().onsuccess = checkComplete;

      transaction.onerror = () => {
        reject(new Error("Failed to clear database"));
      };
    });
  }
}
