import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { db } from "~/api/browser/db";
import type { Workspace } from "~/types/workspace";

/**
 * Custom hook to fetch and manage workspace settings
 * @returns Object containing workspace, loading state, error, and update functions
 */
export const useWorkspace = () => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspace = useCallback(async () => {
    try {
      setIsLoading(true);

      // get() will automatically create default workspace if it doesn't exist
      const workspaceData = await db.getWorkspace();
      setWorkspace(workspaceData);
    } catch (err) {
      toast.error("Failed to fetch workspace", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const updateWorkspace = useCallback(
    async (updates: Partial<Workspace>) => {
      try {
        // get() will automatically create default workspace if it doesn't exist
        const currentWorkspace = workspace || (await db.getWorkspace());

        if (!currentWorkspace) {
          toast.error("Workspace not found", {
            description: "Unable to update workspace settings",
          });
          return;
        }

        const updatedWorkspace: Workspace = {
          ...currentWorkspace,
          ...updates,
        };

        await db.saveWorkspace(updatedWorkspace);
        setWorkspace(updatedWorkspace);
      } catch (err) {
        toast.error("Failed to update workspace", {
          description:
            err instanceof Error ? err.message : "An unexpected error occurred",
        });
      }
    },
    [workspace]
  );

  const updateLastNoteId = useCallback(
    async (noteId: string | null) => {
      await updateWorkspace({ lastNoteId: noteId });
    },
    [updateWorkspace]
  );

  return {
    workspace,
    isLoading,
    refetch: fetchWorkspace,
    updateWorkspace,
    updateLastNoteId,
  };
};
