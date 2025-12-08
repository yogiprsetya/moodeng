import type { Note, Collection, SyncStatus } from "~/types/note";
import type { IBrowserDB } from "./interface";
import type { StorageAdapter } from "../adapter";
import { LocalStorageAdapter } from "./storage-adapter";
import { NoteStorage } from "./note-storage";
import { CollectionStorage } from "./collection-storage";

export class BrowserStorage implements StorageAdapter {
  private noteStorage: NoteStorage;
  private collectionStorage: CollectionStorage;
  private storage: IBrowserDB;

  constructor(storageAdapter?: IBrowserDB) {
    this.storage = storageAdapter ?? new LocalStorageAdapter();
    this.noteStorage = new NoteStorage(this.storage);
    this.collectionStorage = new CollectionStorage(this.storage);
  }

  // Notes operations
  async getNote(id: string): Promise<Note | null> {
    return this.noteStorage.getNote(id);
  }

  async getAllNotes(): Promise<Note[]> {
    return this.noteStorage.getAllNotes();
  }

  async createNote(
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ): Promise<Note> {
    return this.noteStorage.createNote(note);
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    return this.noteStorage.updateNote(id, updates);
  }

  async deleteNote(id: string): Promise<void> {
    return this.noteStorage.deleteNote(id);
  }

  // Collections operations
  async getCollection(id: string): Promise<Collection | null> {
    return this.collectionStorage.getCollection(id);
  }

  async getAllCollections(): Promise<Collection[]> {
    return this.collectionStorage.getAllCollections();
  }

  async createCollection(
    collection: Omit<Collection, "id" | "createdAt" | "updatedAt">
  ): Promise<Collection> {
    return this.collectionStorage.createCollection(collection);
  }

  async updateCollection(
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection> {
    return this.collectionStorage.updateCollection(id, updates);
  }

  async deleteCollection(id: string): Promise<void> {
    return this.collectionStorage.deleteCollection(id);
  }

  // Batch operations
  async updateSyncStatus(id: string, status: SyncStatus): Promise<void> {
    const noteUpdated = await this.noteStorage.updateSyncStatus(id, status);
    if (!noteUpdated) {
      await this.collectionStorage.updateSyncStatus(id, status);
    }
  }

  async getPendingSync(): Promise<(Note | Collection)[]> {
    const allNotes = await this.noteStorage.getAllNotesForSync();
    const allCollections =
      await this.collectionStorage.getAllCollectionsForSync();
    return [
      ...allNotes.filter((n) => !n.deleted && n.syncStatus === "pending"),
      ...allCollections.filter((c) => !c.deleted && c.syncStatus === "pending"),
    ];
  }
}
