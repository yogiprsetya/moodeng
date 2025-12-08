import type { Note, SyncStatus } from "~/types/note";
import type { IBrowserDB } from "./interface";

const NOTES_KEY = "moodeng-notes";

export class NoteStorage {
  private storage: IBrowserDB;

  constructor(storage: IBrowserDB) {
    this.storage = storage;
  }

  private getNotes(): Note[] {
    const stored = this.storage.getItem(NOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveNotes(notes: Note[]): void {
    this.storage.setItem(NOTES_KEY, JSON.stringify(notes));
  }

  async getNote(id: string): Promise<Note | null> {
    const notes = this.getNotes();
    return notes.find((n) => n.id === id && !n.deleted) ?? null;
  }

  async getAllNotes(): Promise<Note[]> {
    const notes = this.getNotes();
    return notes.filter((n) => !n.deleted);
  }

  async createNote(
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ): Promise<Note> {
    const notes = this.getNotes();
    const now = Date.now();
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    notes.push(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error(`Note with id ${id} not found`);
    }
    const updatedNote: Note = {
      ...notes[index],
      ...updates,
      updatedAt: Date.now(),
    };
    notes[index] = updatedNote;
    this.saveNotes(notes);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<void> {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes[index].deleted = true;
      notes[index].updatedAt = Date.now();
      this.saveNotes(notes);
    }
  }

  // Sync operations
  async updateSyncStatus(id: string, status: SyncStatus): Promise<boolean> {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes[index].syncStatus = status;
      notes[index].updatedAt = Date.now();
      this.saveNotes(notes);
      return true;
    }
    return false;
  }

  async getAllNotesForSync(): Promise<Note[]> {
    return this.getNotes();
  }
}
