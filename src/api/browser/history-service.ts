import type { Note } from "~/types/note";
import type { History, HistoryType } from "~/types/history";
import { HistoriesRepository } from "./histories-repository";

/**
 * Service for handling history logging as a cross-cutting concern.
 * Separates history logging logic from the database facade.
 */
export class HistoryService {
  private histories: HistoriesRepository;

  constructor(histories: HistoriesRepository) {
    this.histories = histories;
  }

  /**
   * Log history entry for a note operation
   */
  async logHistory(params: {
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

  /**
   * Log history when a note is created
   */
  async logNoteCreated(note: Note): Promise<void> {
    await this.logHistory({
      noteId: note.id,
      type: "created",
      payload: {
        title: note.title,
        folderId: note.folderId,
      },
    });
  }

  /**
   * Log history when a note is updated
   */
  async logNoteUpdated(
    before: Note,
    updated: Note,
    updates: Partial<Note>
  ): Promise<void> {
    const moved =
      typeof updates.folderId !== "undefined" &&
      before.folderId !== updated.folderId;
    const toggledDeleted =
      typeof updates.deleted !== "undefined" &&
      before.deleted !== updated.deleted;

    let type: HistoryType = "updated";
    if (toggledDeleted) type = updated.deleted ? "deleted" : "restored";
    else if (moved) type = "moved";

    await this.logHistory({
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

  /**
   * Log history when a note is deleted (soft delete only)
   */
  async logNoteDeleted(noteId: string): Promise<void> {
    await this.logHistory({
      noteId,
      type: "deleted",
      payload: { hardDelete: false },
    });
  }

  /**
   * Log history when a note is restored
   */
  async logNoteRestored(noteId: string): Promise<void> {
    await this.logHistory({
      noteId,
      type: "restored",
      payload: {},
    });
  }
}
