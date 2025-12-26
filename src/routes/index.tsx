import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDataStore } from "~/stores/data-store";
import { useWorkspaceStore } from "~/stores/data-workspace";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { notes, getNote } = useDataStore();
  const {
    workspace,
    isLoadingWorkspace: isWorkspaceLoading,
  } = useWorkspaceStore();

  const noteId = workspace?.lastNoteId;
  const note = noteId ? notes.find((n) => n.id === noteId) : null;

  useEffect(() => {
    // Load note if not in store
    if (noteId && !note) {
      getNote(noteId);
    }
  }, [noteId, note, getNote]);

  useEffect(() => {
    // Verify the note still exists and is not deleted
    if (note && !note.deleted && workspace?.lastNoteId) {
      navigate({ to: "/n/$id", params: { id: workspace.lastNoteId } });
    }
  }, [note, workspace?.lastNoteId, navigate]);

  if (isWorkspaceLoading) {
    return null; // or a loading spinner
  }

  return <p />;
}
