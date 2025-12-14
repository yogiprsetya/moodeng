import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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

  const fetchNote = useCallback(async () => {
    if (!noteId) {
      setNote(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const fetchedNote = await db.getNote(noteId);
      console.log(fetchedNote);
      setNote(fetchedNote);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch note");
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
    refetch: fetchNote,
  };
};
