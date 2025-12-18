import { useCallback, useEffect, useState } from "react";
import { db } from "~/api/browser/db";
import type { History } from "~/types/history";

export function useHistories(params?: { noteId?: string; limit?: number }) {
  const noteId = params?.noteId;
  const limit = params?.limit ?? 100;

  const [histories, setHistories] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = noteId
        ? await db.getHistoriesByNoteId(noteId, limit)
        : await db.getRecentHistories(limit);
      setHistories(data);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { histories, isLoading, refetch };
}
