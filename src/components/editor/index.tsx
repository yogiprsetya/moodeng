import { MarkdownEditor } from "./markdown-editor";
import { TitleEditor } from "./title-editor";
import { FolderSelector } from "./folder-selector";
import { useParams } from "@tanstack/react-router";
import { useState, lazy, Suspense, useCallback, useEffect } from "react";
import { useDataStore } from "~/stores/data-store";
import { handleError } from "~/utils/error-handle";
import { useEditorStore } from "~/stores/editor-store";
import { Button } from "~/components/ui/button";
import { Clock } from "lucide-react";

const HistorySheet = lazy(() =>
  import("~/components/common/history-sheet").then((module) => ({
    default: module.HistorySheet,
  }))
);

export const Editor = () => {
  const { id: noteId } = useParams({ strict: false });
  const { getNote, updateNote } = useDataStore();
  const { setSyncStatus } = useEditorStore();

  // Get note from store
  const note = useDataStore((state) =>
    noteId ? state.notes.find((n) => n.id === noteId) : null
  );

  // Load note if not in store
  useEffect(() => {
    if (noteId && !note) {
      getNote(noteId);
    }
  }, [noteId, note, getNote]);

  const updateTitle = useCallback(
    async (newTitle: string) => {
      const trimmedTitle = newTitle.trim() || "";

      if (noteId) {
        try {
          await updateNote(noteId, {
            title: trimmedTitle,
            updatedAt: Date.now(),
          });
          // Store is automatically updated by updateNote, sidebar will reactively update
        } catch (err) {
          handleError(err);
        }
      }
    },
    [noteId, updateNote]
  );

  const updateContent = useCallback(
    async (newContent: string) => {
      setSyncStatus("saving");

      if (noteId) {
        try {
          await updateNote(noteId, {
            content: newContent,
            updatedAt: Date.now(),
          });
        } catch (err) {
          handleError(err);
        } finally {
          setTimeout(() => setSyncStatus("saved"), 1000);
        }
      }
    },
    [noteId, updateNote, setSyncStatus]
  );

  const updateFolder = useCallback(
    async (folderId: string | null) => {
      if (noteId) {
        try {
          await updateNote(noteId, {
            folderId,
            updatedAt: Date.now(),
          });
          // Store is automatically updated by updateNote, sidebar will reactively update
        } catch (err) {
          handleError(err);
        }
      }
    },
    [noteId, updateNote]
  );

  const content = note || null;
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <FolderSelector
          value={content?.folderId ?? null}
          onChange={updateFolder}
        />

        <Button
          variant="ghost"
          size="icon"
          title="History"
          onClick={() => setHistoryOpen(true)}
        >
          <Clock />
          <span className="sr-only">Open history</span>
        </Button>
      </div>

      <TitleEditor value={content?.title ?? ""} onChange={updateTitle} />
      <MarkdownEditor value={content?.content ?? ""} onChange={updateContent} />

      <Suspense fallback={null}>
        <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
      </Suspense>
    </div>
  );
};
