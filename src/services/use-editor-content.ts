import { useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { db } from "~/api/browser/db";

export const useEditorContent = () => {
  const { id: noteId } = useParams({ strict: false });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Load note from database when noteId changes
  useEffect(() => {
    if (noteId) {
      const loadNote = async () => {
        try {
          const note = await db.getNote(noteId);
          if (note) {
            setTitle(note.title);
            setContent(note.content);
          }
        } catch (err) {
          console.error("Error loading note:", err);
        }
      };
      loadNote();
    }
  }, [noteId]);

  const updateTitle = useCallback(
    async (newTitle: string) => {
      const trimmedTitle = newTitle.trim() || "";

      // Update local state immediately
      setTitle(trimmedTitle);

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
      // Update local state immediately
      setContent(newContent);

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
    title,
    content,
    updateTitle,
    updateContent,
  };
};
