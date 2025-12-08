const DB_NAME = "moodeng-db";
const DB_VERSION = 1;

export const STORES = {
  WORKSPACE: "workspace",
  NOTES: "notes",
  COLLECTIONS: "collections",
} as const;

/**
 * Base database connection class that handles IndexedDB initialization
 */
export class DBDriver {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the IndexedDB database
   */
  private async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create workspace store (single object)
        if (!db.objectStoreNames.contains(STORES.WORKSPACE)) {
          db.createObjectStore(STORES.WORKSPACE);
        }

        // Create notes store with indexes
        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          const notesStore = db.createObjectStore(STORES.NOTES, {
            keyPath: "id",
          });
          notesStore.createIndex("folderId", "folderId", { unique: false });
          notesStore.createIndex("deleted", "deleted", { unique: false });
          notesStore.createIndex("syncStatus", "syncStatus", { unique: false });
          notesStore.createIndex("isPinned", "isPinned", { unique: false });
          notesStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }

        // Create collections store with indexes
        if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
          const collectionsStore = db.createObjectStore(STORES.COLLECTIONS, {
            keyPath: "id",
          });
          collectionsStore.createIndex("deleted", "deleted", { unique: false });
          collectionsStore.createIndex("syncStatus", "syncStatus", {
            unique: false,
          });
          collectionsStore.createIndex("updatedAt", "updatedAt", {
            unique: false,
          });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Ensure database is initialized and return the database instance
   */
  async getDB(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }
}
