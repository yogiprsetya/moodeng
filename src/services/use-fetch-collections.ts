import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { db } from "~/api/browser/db";
import type { Collection } from "~/types/note";

interface UseFetchCollectionsOptions {
  includeDeleted?: boolean;
}

/**
 * Custom hook to fetch all collections
 * @param options - Configuration options
 * @param options.includeDeleted - Whether to include deleted collections (default: false)
 * @returns Object containing collections, loading state, and refetch function
 */
export const useFetchCollections = (
  options: UseFetchCollectionsOptions = {}
) => {
  const { includeDeleted = false } = options;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const allCollections = await db.getAllCollections(includeDeleted);
      setCollections(allCollections);
    } catch (err) {
      toast.error("Failed to fetch collections", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, [includeDeleted]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    isLoading,
    refetch: fetchCollections,
  };
};
