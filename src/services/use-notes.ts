import { db } from "~/api/browser/db";
import { useCallback, useEffect, useState } from "react";
import type { Note } from "~/types/note";
import { useNavigate } from "@tanstack/react-router";

export const useNotes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  // Fetch notes from database
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const allNotes = await db.getAllNotes();
      setNotes(allNotes);
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    // Listen for note updates and refresh the list
    const handleNoteUpdated = () => {
      fetchNotes();
    };

    window.addEventListener("note-updated", handleNoteUpdated);

    return () => {
      window.removeEventListener("note-updated", handleNoteUpdated);
    };
  }, []);

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
        setNotes((prev) => [...prev, newNote]);
        navigate({ to: "/n/$id", params: { id: newNote.id } });
      } catch (err) {
        console.error("Error creating note:", err);
      }
    },
    [navigate]
  );

  const handleDeleteNote = useCallback(async (noteId: string) => {
    try {
      await db.deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  }, []);

  return {
    isLoading,
    notes,
    handleCreateNewNote,
    handleDeleteNote,
  };
};
