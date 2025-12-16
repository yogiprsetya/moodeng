import { db } from "~/api/browser/db";
import { useCallback, useEffect } from "react";
import type { Note } from "~/types/note";
import { useNavigate } from "@tanstack/react-router";
import { useFetchNotes } from "./use-fetch-notes";

export const useNotes = () => {
  const { notes, isLoading, refetch: fetchNotes } = useFetchNotes();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for note updates and refresh the list
    const handleNoteUpdated = () => {
      fetchNotes();
    };

    window.addEventListener("note-updated", handleNoteUpdated);

    return () => {
      window.removeEventListener("note-updated", handleNoteUpdated);
    };
  }, [fetchNotes]);

  const handleCreateNewNote = useCallback(
    async (selectedFolder?: string | null) => {
      const folderId = selectedFolder ?? null;

      try {
        const newNote: Note = {
          id: crypto.randomUUID(),
          title: "Untitled Note",
          content: "",
          folderId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          deleted: false,
          syncStatus: "pending",
          icon: "",
          labelColor: "",
          isPinned: false,
        };

        await db.createNote(newNote);
        fetchNotes(); // Refresh the notes list
        navigate({ to: "/n/$id", params: { id: newNote.id } });
      } catch (err) {
        console.error("Error creating note:", err);
      }
    },
    [navigate, fetchNotes]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      try {
        await db.deleteNote(noteId);
        fetchNotes(); // Refresh the notes list
      } catch (err) {
        console.error("Error deleting note:", err);
      }
    },
    [fetchNotes]
  );

  const handleTogglePin = useCallback(
    async (noteId: string) => {
      try {
        const note = notes.find((n) => n.id === noteId);
        if (!note) return;

        await db.updateNote(noteId, { isPinned: !note.isPinned });
        fetchNotes(); // Refresh the notes list
      } catch (err) {
        console.error("Error toggling pin:", err);
      }
    },
    [notes, fetchNotes]
  );

  return {
    isLoading,
    notes,
    handleCreateNewNote,
    handleDeleteNote,
    handleTogglePin,
    refetch: fetchNotes,
  };
};
