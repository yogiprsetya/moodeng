import { db } from "~/services/browser/db";
import { useCallback, useEffect, useState } from "react";
import type { Note } from "~/types/note";
import { useNavigate } from "@tanstack/react-router";

export const useNotes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  // Fetch notes from database
  useEffect(() => {
    async function fetchNotes() {
      try {
        setIsLoading(true);
        // setError(null);
        const allNotes = await db.getAllNotes();
        setNotes(allNotes);
      } catch (err) {
        // setError(
        //   err instanceof Error ? err : new Error("Failed to load notes")
        // );
        console.error("Error fetching notes:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotes();
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
        // setError(err instanceof Error ? err : new Error("Failed to create note"));
      }
    },
    [navigate]
  );

  return {
    isLoading,
    notes,
    handleCreateNewNote,
  };
};
