import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { db } from "~/api/browser/db";
import type { Collection } from "~/types/note";
import { useFetchNotes } from "./use-fetch-notes";

interface UseFetchCollectionsOptions {
  includeDeleted?: boolean;
}

/**
 * Custom hook to fetch all collections
 * @param options - Configuration options
 * @param options.includeDeleted - Whether to include deleted collections (default: false)
 * @returns Object containing collections, loading state, and refetch function
 */
export const useCollections = (options: UseFetchCollectionsOptions = {}) => {
  const { includeDeleted = false } = options;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { refetch: defaultRefetchNotes } = useFetchNotes();

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

  const createCollection = useCallback(
    async (name: string): Promise<Collection> => {
      const newCollection: Collection = {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
        syncStatus: "pending",
        icon: "",
        labelColor: "",
      };

      await db.createCollection(newCollection);
      await fetchCollections();
      return newCollection;
    },
    [fetchCollections]
  );

  const deleteCollection = useCallback(
    async (collectionId: string, cascadeDelete: boolean) => {
      if (!collectionId) return;

      await db.deleteCollectionWithNotes(collectionId, cascadeDelete);

      fetchCollections();
      defaultRefetchNotes();
    },
    [fetchCollections, defaultRefetchNotes]
  );

  return {
    collections,
    isLoading,
    refetch: fetchCollections,
    createCollection,
    deleteCollection,
  };
};
