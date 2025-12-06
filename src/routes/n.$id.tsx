import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MarkdownEditor } from "~/components/editor/markdown-editor";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = Route.useParams();
  const [content, setContent] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Note
        </h1>
      </div>

      <MarkdownEditor value={content} onChange={setContent} />
    </div>
  );
}
