import { useState, useEffect, useCallback } from "react";
import { db } from "~/api/browser/db";
import type { Note } from "~/types/note";

interface UseFetchNoteByIdOptions {
  noteId: string | null | undefined;
}

/**
 * Custom hook to fetch a note by ID
 * @param options - Configuration options
 * @param options.noteId - The ID of the note to fetch
 * @returns Object containing note, loading state, error, and refetch function
 */
export const useFetchNoteById = (options: UseFetchNoteByIdOptions) => {
  const { noteId } = options;
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNote = useCallback(async () => {
    if (!noteId) {
      setNote(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedNote = await db.getNote(noteId);
      setNote(fetchedNote);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch note");
      setError(error);
      console.error("Error fetching note:", err);
      setNote(null);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  return {
    note,
    isLoading,
    error,
    refetch: fetchNote,
  };
};
