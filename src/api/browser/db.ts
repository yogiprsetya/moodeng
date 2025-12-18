import type { Note } from "~/types/note";
import type { Collection } from "~/types/note";
import type { Workspace } from "~/types/workspace";
import type { History, HistoryType } from "~/types/history";
import { DBDriver } from "./db-driver";
import { WorkspaceRepository } from "./workspace-repository";
import { NotesRepository } from "./notes-repository";
import { CollectionsRepository } from "./collections-repository";
import { DBMaintenance } from "./db-maintenance";
import { HistoriesRepository } from "./histories-repository";

/**
 * LocalDB is a facade that provides a unified interface to all repositories.
 * It delegates operations to specialized repository classes.
 */
export class LocalDB {
  private database: DBDriver;
  public readonly workspace: WorkspaceRepository;
  public readonly notes: NotesRepository;
  public readonly collections: CollectionsRepository;
  public readonly histories: HistoriesRepository;
  public readonly maintenance: DBMaintenance;

  constructor(database?: DBDriver) {
    this.database = database ?? new DBDriver();
    this.workspace = new WorkspaceRepository(this.database);
    this.notes = new NotesRepository(this.database);
    this.collections = new CollectionsRepository(this.database);
    this.histories = new HistoriesRepository(this.database);
    this.maintenance = new DBMaintenance(this.database);
  }

  private async appendHistory(params: {
    noteId: string;
    type: HistoryType;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const history: History = {
      id: crypto.randomUUID(),
      noteId: params.noteId,
      type: params.type,
      payload: params.payload,
      createdAt: Date.now(),
      deleted: false,
      syncStatus: "pending",
    };
    await this.histories.create(history);
  }

  // ==================== WORKSPACE CRUD (delegated) ====================

  /**
   * Get workspace settings
   */
  async getWorkspace(): Promise<Workspace | null> {
    return this.workspace.get();
  }

  /**
   * Create or update workspace settings
   */
  async saveWorkspace(workspace: Workspace): Promise<void> {
    return this.workspace.save(workspace);
  }

  /**
   * Delete workspace settings
   */
  async deleteWorkspace(): Promise<void> {
    return this.workspace.delete();
  }

  // ==================== NOTES CRUD (delegated) ====================

  /**
   * Create a new note
   */
  async createNote(note: Note): Promise<Note> {
    const created = await this.notes.create(note);
    await this.appendHistory({
      noteId: created.id,
      type: "created",
      payload: {
        title: created.title,
        folderId: created.folderId,
      },
    });
    return created;
  }

  /**
   * Get a note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    return this.notes.getById(id);
  }

  /**
   * Get all notes (optionally filter by deleted status)
   */
  async getAllNotes(includeDeleted = false): Promise<Note[]> {
    return this.notes.getAll(includeDeleted);
  }

  /**
   * Get notes by folder ID
   */
  async getNotesByFolder(folderId: string | null): Promise<Note[]> {
    return this.notes.getByFolder(folderId);
  }

  /**
   * Get pinned notes
   */
  async getPinnedNotes(): Promise<Note[]> {
    return this.notes.getPinned();
  }

  /**
   * Update a note
   */
  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const before = await this.notes.getById(id);
    const updated = await this.notes.update(id, updates);

    if (before) {
      const moved =
        typeof updates.folderId !== "undefined" &&
        before.folderId !== updated.folderId;
      const toggledDeleted =
        typeof updates.deleted !== "undefined" &&
        before.deleted !== updated.deleted;

      let type: HistoryType = "updated";
      if (toggledDeleted) type = updated.deleted ? "deleted" : "restored";
      else if (moved) type = "moved";

      await this.appendHistory({
        noteId: updated.id,
        type,
        payload: {
          before: {
            title: before.title,
            folderId: before.folderId,
            deleted: before.deleted,
            isPinned: before.isPinned,
          },
          updates,
          after: {
            title: updated.title,
            folderId: updated.folderId,
            deleted: updated.deleted,
            isPinned: updated.isPinned,
          },
        },
      });
    }

    return updated;
  }

  /**
   * Delete a note (soft delete by default)
   */
  async deleteNote(id: string, hardDelete = false): Promise<void> {
    const before = await this.notes.getById(id);
    await this.notes.delete(id, hardDelete);

    // only log soft-delete (hard delete removes record)
    if (!hardDelete && before) {
      await this.appendHistory({
        noteId: id,
        type: "deleted",
        payload: { hardDelete: false },
      });
    }
  }

  /**
   * Restore a soft-deleted note
   */
  async restoreNote(id: string): Promise<Note> {
    const restored = await this.notes.restore(id);
    await this.appendHistory({
      noteId: id,
      type: "restored",
      payload: {},
    });
    return restored;
  }

  // ==================== HISTORIES (delegated) ====================

  async getRecentHistories(limit = 100): Promise<History[]> {
    return this.histories.getRecent(limit);
  }

  async getHistoriesByNoteId(noteId: string, limit = 100): Promise<History[]> {
    return this.histories.getByNoteId(noteId, limit);
  }

  // ==================== COLLECTIONS CRUD (delegated) ====================

  /**
   * Create a new collection
   */
  async createCollection(collection: Collection): Promise<Collection> {
    return this.collections.create(collection);
  }

  /**
   * Get a collection by ID
   */
  async getCollection(id: string): Promise<Collection | null> {
    return this.collections.getById(id);
  }

  /**
   * Get all collections (optionally filter by deleted status)
   */
  async getAllCollections(includeDeleted = false): Promise<Collection[]> {
    return this.collections.getAll(includeDeleted);
  }

  /**
   * Update a collection
   */
  async updateCollection(
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection> {
    return this.collections.update(id, updates);
  }

  /**
   * Delete a collection (soft delete by default)
   */
  async deleteCollection(id: string, hardDelete = false): Promise<void> {
    return this.collections.delete(id, hardDelete);
  }

  /**
   * Delete a collection and handle its notes using CASCADE or SET NULL strategy
   * @param id Collection ID to delete
   * @param cascadeDelete If true, CASCADE delete all notes. If false, SET NULL (move notes to root)
   * @param hardDelete If true, hard delete the collection
   */
  async deleteCollectionWithNotes(
    id: string,
    cascadeDelete: boolean,
    hardDelete = false
  ): Promise<void> {
    // First handle the notes (CASCADE or SET NULL)
    await this.notes.handleNotesByFolder(id, cascadeDelete);
    // Then delete the collection
    await this.collections.delete(id, hardDelete);
  }

  /**
   * Restore a soft-deleted collection
   */
  async restoreCollection(id: string): Promise<Collection> {
    return this.collections.restore(id);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all data from the database
   * @deprecated Use db.maintenance.clearAll() instead
   */
  async clearAll(): Promise<void> {
    return this.maintenance.clearAll();
  }

  /**
   * Get notes with pending sync status
   */
  async getPendingSyncNotes(): Promise<Note[]> {
    return this.notes.getPendingSync();
  }

  /**
   * Get collections with pending sync status
   */
  async getPendingSyncCollections(): Promise<Collection[]> {
    return this.collections.getPendingSync();
  }
}

// Export a singleton instance
export const db = new LocalDB();
