import { createFileRoute, useParams } from "@tanstack/react-router";
import { Editor } from "~/components/editor";
import { useEffect } from "react";
import { useWorkspace } from "~/services/use-workspace";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  const { id } = useParams({ from: "/n/$id" });
  const { workspace, updateLastNoteId } = useWorkspace();

  useEffect(() => {
    console.log("workspace", workspace);
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
