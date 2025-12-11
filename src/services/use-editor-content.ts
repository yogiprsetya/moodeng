import { useParams } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import { db } from "~/api/browser/db";
import { useFetchNoteById } from "./use-fetch-note-by-id";
import { useEditorStore } from "~/stores/editor-store";

export const useEditorContent = () => {
  const { id: noteId } = useParams({ strict: false });

  const { note } = useFetchNoteById({ noteId });
  const { setSyncStatus } = useEditorStore();

  const updateTitle = useCallback(
    async (newTitle: string) => {
      const trimmedTitle = newTitle.trim() || "";

      // Save to database if we have a note ID
      if (noteId) {
        try {
          await db.updateNote(noteId, {
            title: trimmedTitle,
            updatedAt: Date.now(),
          });
          // Trigger a custom event to notify other components
          window.dispatchEvent(
            new CustomEvent("note-updated", { detail: { noteId } })
          );
        } catch (err) {
          toast.error("Failed to update note title", {
            description:
              err instanceof Error
                ? err.message
                : "An unexpected error occurred",
          });
        }
      }
    },
    [noteId]
  );

  const updateContent = useCallback(
    async (newContent: string) => {
      setSyncStatus("saving");
      // Save to database if we have a note ID
      if (noteId) {
        try {
          await db.updateNote(noteId, {
            content: newContent,
            updatedAt: Date.now(),
          });
        } catch (err) {
          toast.error("Failed to update note content", {
            description:
              err instanceof Error
                ? err.message
                : "An unexpected error occurred",
          });
        } finally {
          setTimeout(() => setSyncStatus("saved"), 1000);
        }
      }
    },
    [noteId, setSyncStatus]
  );

  return {
    content: note,
    updateTitle,
    updateContent,
  };
};
