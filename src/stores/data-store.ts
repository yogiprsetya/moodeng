import { create } from "zustand";
import { db } from "~/api/browser/db";
import type { Note } from "~/types/note";
import type { Collection } from "~/types/note";
import type { History } from "~/types/history";
import { devtools } from "zustand/middleware";

interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
}

/**
 * Generic helper to update an item in an array
 */
function updateItemInArray<T extends BaseEntity>(
  array: T[],
  id: string,
  updated: T
): T[] {
  const index = array.findIndex((item) => item.id === id);
  if (index !== -1) {
    const updatedArray = [...array];
    updatedArray[index] = updated;
    return updatedArray;
  }
  return [...array, updated];
}

/**
 * Generic helper to add an item to an array
 */
function addItemToArray<T extends BaseEntity>(array: T[], item: T): T[] {
  return [...array, item];
}

/**
 * Generic helper to remove an item from an array
 */
function removeItemFromArray<T extends BaseEntity>(
  array: T[],
  id: string
): T[] {
  return array.filter((item) => item.id !== id);
}

/**
 * Generic helper to soft delete an item in an array
 */
function softDeleteItemInArray<T extends BaseEntity & { deleted: boolean }>(
  array: T[],
  id: string
): T[] {
  const index = array.findIndex((item) => item.id === id);
  if (index !== -1) {
    const updatedArray = [...array];
    updatedArray[index] = { ...updatedArray[index], deleted: true };
    return updatedArray;
  }
  return array;
}

interface DataStore {
  // State
  notes: Note[];
  collections: Collection[];
  histories: History[];

  // Loading states
  isLoadingNotes: boolean;
  isLoadingCollections: boolean;
  isLoadingHistories: boolean;

  // Errors
  notesError: Error | null;
  collectionsError: Error | null;
  historiesError: Error | null;

  // Notes actions
  loadNotes: (includeDeleted?: boolean) => Promise<void>;
  initNotesLoad: () => Promise<void>;
  createNote: (
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => Promise<Note>;
  getNote: (id: string) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string, hardDelete?: boolean) => Promise<void>;
  restoreNote: (id: string) => Promise<Note>;
  getNotesByFolder: (folderId: string | null) => Promise<Note[]>;
  getPinnedNotes: () => Promise<Note[]>;
  togglePinNote: (id: string) => Promise<void>;

  // Collections actions
  loadCollections: (includeDeleted?: boolean) => Promise<void>;
  initCollectionLoad: () => Promise<void>;
  createCollection: (
    collection: Omit<Collection, "id" | "createdAt" | "updatedAt">
  ) => Promise<Collection>;
  getCollection: (id: string) => Promise<Collection | null>;
  updateCollection: (
    id: string,
    updates: Partial<Collection>
  ) => Promise<Collection>;
  deleteCollection: (id: string, hardDelete?: boolean) => Promise<void>;
  deleteCollectionWithNotes: (
    id: string,
    cascadeDelete: boolean,
    hardDelete?: boolean
  ) => Promise<void>;
  restoreCollection: (id: string) => Promise<Collection>;

  // Histories actions
  loadHistories: (noteId?: string, limit?: number) => Promise<void>;
  getRecentHistories: (limit?: number) => Promise<History[]>;
  getHistoriesByNoteId: (noteId: string, limit?: number) => Promise<History[]>;

  // Utility actions
  initialize: () => Promise<void>;
  clearErrors: () => void;
}

export const useDataStore = create<DataStore>()(
  devtools((set, get) => ({
    // Initial state
    notes: [],
    collections: [],
    histories: [],

    isLoadingNotes: false,
    isLoadingCollections: false,
    isLoadingHistories: false,

    notesError: null,
    collectionsError: null,
    historiesError: null,

    // Notes actions
    loadNotes: async (includeDeleted = false) => {
      set({ notesError: null });
      try {
        const notes = await db.getAllNotes(includeDeleted);
        set({ notes });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load notes");
        set({ notesError: error });
      }
    },

    initNotesLoad: async () => {
      set({ isLoadingNotes: true, notesError: null });
      try {
        const notes = await db.getAllNotes(false);
        set({ notes, isLoadingNotes: false });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load notes");
        set({ notesError: error, isLoadingNotes: false });
      }
    },

    createNote: async (noteData) => {
      const newNote: Note = {
        ...noteData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const created = await db.createNote(newNote);
      const { notes } = get();
      set({ notes: addItemToArray(notes, created) });
      return created;
    },

    getNote: async (id: string) => {
      const note = await db.getNote(id);
      if (note) {
        // Update the note in the store if it exists
        const { notes } = get();
        set({ notes: updateItemInArray(notes, id, note) });
      }
      return note;
    },

    updateNote: async (id: string, updates: Partial<Note>) => {
      const updated = await db.updateNote(id, updates);
      const { notes } = get();
      set({ notes: updateItemInArray(notes, id, updated) });
      return updated;
    },

    deleteNote: async (id: string, hardDelete = false) => {
      await db.deleteNote(id, hardDelete);
      const { notes } = get();

      if (hardDelete) {
        set({ notes: removeItemFromArray(notes, id) });
      } else {
        // Soft delete - update the note
        set({ notes: softDeleteItemInArray(notes, id) });
      }
    },

    restoreNote: async (id: string) => {
      const restored = await db.restoreNote(id);
      const { notes } = get();
      set({ notes: updateItemInArray(notes, id, restored) });
      return restored;
    },

    getNotesByFolder: async (folderId: string | null) => {
      return await db.getNotesByFolder(folderId);
    },

    getPinnedNotes: async () => {
      return await db.getPinnedNotes();
    },

    togglePinNote: async (id: string) => {
      const { notes } = get();
      const note = notes.find((n) => n.id === id);
      if (note) {
        await get().updateNote(id, { isPinned: !note.isPinned });
      }
    },

    // Collections actions
    loadCollections: async (includeDeleted = false) => {
      set({ collectionsError: null });
      try {
        const collections = await db.getAllCollections(includeDeleted);
        set({ collections });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load collections");
        set({ collectionsError: error });
      }
    },

    initCollectionLoad: async () => {
      set({ isLoadingCollections: true, collectionsError: null });
      try {
        const collections = await db.getAllCollections(false);
        set({ collections, isLoadingCollections: false });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load collections");
        set({ collectionsError: error, isLoadingCollections: false });
      }
    },

    createCollection: async (collectionData) => {
      const newCollection: Collection = {
        ...collectionData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const created = await db.createCollection(newCollection);
      const { collections } = get();
      set({ collections: addItemToArray(collections, created) });
      return created;
    },

    getCollection: async (id: string) => {
      return await db.getCollection(id);
    },

    updateCollection: async (id: string, updates: Partial<Collection>) => {
      const updated = await db.updateCollection(id, updates);
      const { collections } = get();
      set({ collections: updateItemInArray(collections, id, updated) });
      return updated;
    },

    deleteCollection: async (id: string, hardDelete = false) => {
      await db.deleteCollection(id, hardDelete);
      const { collections } = get();

      if (hardDelete) {
        set({ collections: removeItemFromArray(collections, id) });
      } else {
        // Soft delete - update the collection
        set({ collections: softDeleteItemInArray(collections, id) });
      }
    },

    deleteCollectionWithNotes: async (
      id: string,
      cascadeDelete: boolean,
      hardDelete = false
    ) => {
      await db.deleteCollectionWithNotes(id, cascadeDelete, hardDelete);

      // Reload collections and notes after deletion
      await get().loadCollections();
      await get().loadNotes();
    },

    restoreCollection: async (id: string) => {
      const restored = await db.restoreCollection(id);
      const { collections } = get();
      set({ collections: updateItemInArray(collections, id, restored) });
      return restored;
    },

    // Histories actions
    loadHistories: async (noteId?: string, limit = 100) => {
      set({ isLoadingHistories: true, historiesError: null });
      try {
        const histories = noteId
          ? await db.getHistoriesByNoteId(noteId, limit)
          : await db.getRecentHistories(limit);
        set({ histories, isLoadingHistories: false });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load histories");
        set({ historiesError: error, isLoadingHistories: false });
      }
    },

    getRecentHistories: async (limit = 100) => {
      return await db.getRecentHistories(limit);
    },

    getHistoriesByNoteId: async (noteId: string, limit = 100) => {
      return await db.getHistoriesByNoteId(noteId, limit);
    },

    // Utility actions
    initialize: async () => {
      // Load all data on initialization
      await Promise.all([get().initNotesLoad(), get().initCollectionLoad()]);
    },

    clearErrors: () => {
      set({
        notesError: null,
        collectionsError: null,
        historiesError: null,
      });
    },
  }))
);
