import type { Collection } from "~/types/note";
import { DBDriver, STORES } from "./db-driver";

/**
 * Repository for collections operations
 */
export class CollectionsRepository {
  private database: DBDriver;

  constructor(database: DBDriver) {
    this.database = database;
  }

  /**
   * Create a new collection
   */
  async create(collection: Collection): Promise<Collection> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.COLLECTIONS], "readwrite");
      const store = transaction.objectStore(STORES.COLLECTIONS);
      const request = store.add(collection);

      request.onsuccess = () => {
        resolve(collection);
      };

      request.onerror = () => {
        reject(new Error("Failed to create collection"));
      };
    });
  }

  /**
   * Get a collection by ID
   */
  async getById(id: string): Promise<Collection | null> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.COLLECTIONS], "readonly");
      const store = transaction.objectStore(STORES.COLLECTIONS);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error("Failed to get collection"));
      };
    });
  }

  /**
   * Get all collections (optionally filter by deleted status)
   */
  async getAll(includeDeleted = false): Promise<Collection[]> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.COLLECTIONS], "readonly");
      const store = transaction.objectStore(STORES.COLLECTIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        const collections = request.result as Collection[];
        if (includeDeleted) {
          resolve(collections);
        } else {
          resolve(collections.filter((collection) => !collection.deleted));
        }
      };

      request.onerror = () => {
        reject(new Error("Failed to get collections"));
      };
    });
  }

  /**
   * Update a collection
   */
  async update(id: string, updates: Partial<Collection>): Promise<Collection> {
    const existingCollection = await this.getById(id);
    if (!existingCollection) {
      throw new Error("Collection not found");
    }

    const updatedCollection: Collection = {
      ...existingCollection,
      ...updates,
      updatedAt: Date.now(),
    };

    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.COLLECTIONS], "readwrite");
      const store = transaction.objectStore(STORES.COLLECTIONS);
      const request = store.put(updatedCollection);

      request.onsuccess = () => {
        resolve(updatedCollection);
      };

      request.onerror = () => {
        reject(new Error("Failed to update collection"));
      };
    });
  }

  /**
   * Delete a collection (soft delete by default)
   */
  async delete(id: string, hardDelete = false): Promise<void> {
    if (hardDelete) {
      const db = await this.database.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.COLLECTIONS], "readwrite");
        const store = transaction.objectStore(STORES.COLLECTIONS);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error("Failed to delete collection"));
        };
      });
    } else {
      // Soft delete
      await this.update(id, { deleted: true });
    }
  }

  /**
   * Restore a soft-deleted collection
   */
  async restore(id: string): Promise<Collection> {
    return this.update(id, { deleted: false });
  }

  /**
   * Get collections with pending sync status
   */
  async getPendingSync(): Promise<Collection[]> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.COLLECTIONS], "readonly");
      const store = transaction.objectStore(STORES.COLLECTIONS);
      const index = store.index("syncStatus");
      const request = index.getAll("pending");

      request.onsuccess = () => {
        resolve(request.result as Collection[]);
      };

      request.onerror = () => {
        reject(new Error("Failed to get pending sync collections"));
      };
    });
  }
}
