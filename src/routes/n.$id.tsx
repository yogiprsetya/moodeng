import { createFileRoute, useParams } from "@tanstack/react-router";
import { Editor } from "~/components/editor";
import { useEffect } from "react";
import { useWorkspaceStore } from "~/stores/data-workspace";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  const { id } = useParams({ from: "/n/$id" });
  const { workspace, updateLastNoteId } = useWorkspaceStore();

  useEffect(() => {
    if (workspace) {
      // Update lastNoteId if it's different (handle backward compatibility)
      const currentLastNoteId = workspace.lastNoteId ?? null;

      if (currentLastNoteId !== id) {
        updateLastNoteId(id);
      }
    }
  }, [id, workspace, updateLastNoteId]);

  return <Editor />;
}
