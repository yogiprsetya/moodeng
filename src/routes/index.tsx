import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useWorkspace } from "~/services/use-workspace";
import { useFetchNoteById } from "~/services/use-fetch-note-by-id";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const { note, isLoading: isNoteLoading } = useFetchNoteById({
    noteId: workspace?.lastNoteId,
  });

  useEffect(() => {
    // Verify the note still exists and is not deleted
    console.log("note", note);
    if (note && !note.deleted && workspace?.lastNoteId) {
      navigate({ to: "/n/$id", params: { id: workspace.lastNoteId } });
    }
  }, [note, workspace?.lastNoteId, navigate]);

  if (isWorkspaceLoading || isNoteLoading) {
    return null; // or a loading spinner
  }

  return <p />;
}
