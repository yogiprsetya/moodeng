import { useParams } from "@tanstack/react-router";
import { useCallback } from "react";
import { db } from "~/api/browser/db";
import { useFetchNoteById } from "./use-fetch-note-by-id";

export const useEditorContent = () => {
  const { id: noteId } = useParams({ strict: false });
  const { note } = useFetchNoteById({ noteId });

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
          console.error("Error updating note title:", err);
        }
      }
    },
    [noteId]
  );

  const updateContent = useCallback(
    async (newContent: string) => {
      // Save to database if we have a note ID
      if (noteId) {
        try {
          await db.updateNote(noteId, {
            content: newContent,
            updatedAt: Date.now(),
          });
        } catch (err) {
          console.error("Error updating note content:", err);
        }
      }
    },
    [noteId]
  );

  return {
    content: note,
    updateTitle,
    updateContent,
  };
};
