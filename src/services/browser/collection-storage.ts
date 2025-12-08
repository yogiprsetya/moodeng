import type { Collection, SyncStatus } from "~/types/note";
import type { IBrowserDB } from "./interface";

const COLLECTIONS_KEY = "moodeng-collections";

export class CollectionStorage {
  private storage: IBrowserDB;

  constructor(storage: IBrowserDB) {
    this.storage = storage;
  }

  private getCollections(): Collection[] {
    const stored = this.storage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveCollections(collections: Collection[]): void {
    this.storage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }

  async getCollection(id: string): Promise<Collection | null> {
    const collections = this.getCollections();
    return collections.find((c) => c.id === id && !c.deleted) ?? null;
  }

  async getAllCollections(): Promise<Collection[]> {
    const collections = this.getCollections();
    return collections.filter((c) => !c.deleted);
  }

  async createCollection(
    collection: Omit<Collection, "id" | "createdAt" | "updatedAt">
  ): Promise<Collection> {
    const collections = this.getCollections();
    const now = Date.now();
    const newCollection: Collection = {
      ...collection,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    collections.push(newCollection);
    this.saveCollections(collections);
    return newCollection;
  }

  async updateCollection(
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection> {
    const collections = this.getCollections();
    const index = collections.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Collection with id ${id} not found`);
    }
    const updatedCollection: Collection = {
      ...collections[index],
      ...updates,
      updatedAt: Date.now(),
    };
    collections[index] = updatedCollection;
    this.saveCollections(collections);
    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<void> {
    const collections = this.getCollections();
    const index = collections.findIndex((c) => c.id === id);
    if (index !== -1) {
      collections[index].deleted = true;
      collections[index].updatedAt = Date.now();
      this.saveCollections(collections);
    }
  }

  // Sync operations
  async updateSyncStatus(id: string, status: SyncStatus): Promise<boolean> {
    const collections = this.getCollections();
    const index = collections.findIndex((c) => c.id === id);
    if (index !== -1) {
      collections[index].syncStatus = status;
      collections[index].updatedAt = Date.now();
      this.saveCollections(collections);
      return true;
    }
    return false;
  }

  async getAllCollectionsForSync(): Promise<Collection[]> {
    return this.getCollections();
  }
}
