import { useState, useEffect, useCallback } from "react";
import { db } from "~/api/browser/db";
import type { Note } from "~/types/note";

interface UseFetchNotesOptions {
  includeDeleted?: boolean;
}

/**
 * Custom hook to fetch all notes
 * @param options - Configuration options
 * @param options.includeDeleted - Whether to include deleted notes (default: false)
 * @returns Object containing notes, loading state, error, and refetch function
 */
export const useFetchNotes = (options: UseFetchNotesOptions = {}) => {
  const { includeDeleted = false } = options;
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allNotes = await db.getAllNotes(includeDeleted);
      setNotes(allNotes);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch notes");
      setError(error);
      console.error("Error fetching notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [includeDeleted]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    refetch: fetchNotes,
  };
};
