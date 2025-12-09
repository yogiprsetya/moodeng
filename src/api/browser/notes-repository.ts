import type { Note } from "~/types/note";
import { DBDriver, STORES } from "./db-driver";

/**
 * Repository for notes operations
 */
export class NotesRepository {
  private database: DBDriver;

  constructor(database: DBDriver) {
    this.database = database;
  }

  /**
   * Create a new note
   */
  async create(note: Note): Promise<Note> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NOTES], "readwrite");
      const store = transaction.objectStore(STORES.NOTES);
      const request = store.add(note);

      request.onsuccess = () => {
        resolve(note);
      };

      request.onerror = () => {
        reject(new Error("Failed to create note"));
      };
    });
  }

  /**
   * Get a note by ID
   */
  async getById(id: string): Promise<Note | null> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NOTES], "readonly");
      const store = transaction.objectStore(STORES.NOTES);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error("Failed to get note"));
      };
    });
  }

  /**
   * Get all notes (optionally filter by deleted status)
   */
  async getAll(includeDeleted = false): Promise<Note[]> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NOTES], "readonly");
      const store = transaction.objectStore(STORES.NOTES);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = request.result as Note[];
        if (includeDeleted) {
          resolve(notes);
        } else {
          resolve(notes.filter((note) => !note.deleted));
        }
      };

      request.onerror = () => {
        reject(new Error("Failed to get notes"));
      };
    });
  }

  /**
   * Get notes by folder ID
   */
  async getByFolder(folderId: string | null): Promise<Note[]> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NOTES], "readonly");
      const store = transaction.objectStore(STORES.NOTES);
      const index = store.index("folderId");
      const request = index.getAll(folderId);

      request.onsuccess = () => {
        const notes = request.result as Note[];
        resolve(notes.filter((note) => !note.deleted));
      };

      request.onerror = () => {
        reject(new Error("Failed to get notes by folder"));
      };
    });
  }

  /**
   * Get pinned notes
   */
  async getPinned(): Promise<Note[]> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NOTES], "readonly");
      const store = transaction.objectStore(STORES.NOTES);
      const index = store.index("isPinned");
      const request = index.getAll(IDBKeyRange.only(true));

      request.onsuccess = () => {
        const notes = request.result as Note[];
        resolve(notes.filter((note) => !note.deleted));
      };

      request.onerror = () => {
        reject(new Error("Failed to get pinned notes"));
      };
    });
  }

  /**
   * Update a note
   */
  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const existingNote = await this.getById(id);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    const updatedNote: Note = {
      ...existingNote,
      ...updates,
      updatedAt: Date.now(),
    };

    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NOTES], "readwrite");
      const store = transaction.objectStore(STORES.NOTES);
      const request = store.put(updatedNote);

      request.onsuccess = () => {
        resolve(updatedNote);
      };

      request.onerror = () => {
        reject(new Error("Failed to update note"));
      };
    });
  }

  /**
   * Delete a note (soft delete by default)
   */
  async delete(id: string, hardDelete = false): Promise<void> {
    if (hardDelete) {
      const db = await this.database.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.NOTES], "readwrite");
        const store = transaction.objectStore(STORES.NOTES);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error("Failed to delete note"));
        };
      });
    } else {
      // Soft delete
      await this.update(id, { deleted: true });
    }
  }

  /**
   * Restore a soft-deleted note
   */
  async restore(id: string): Promise<Note> {
    return this.update(id, { deleted: false });
  }

  /**
   * Get notes with pending sync status
   */
  async getPendingSync(): Promise<Note[]> {
    const db = await this.database.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NOTES], "readonly");
      const store = transaction.objectStore(STORES.NOTES);
      const index = store.index("syncStatus");
      const request = index.getAll("pending");

      request.onsuccess = () => {
        resolve(request.result as Note[]);
      };

      request.onerror = () => {
        reject(new Error("Failed to get pending sync notes"));
      };
    });
  }
}
