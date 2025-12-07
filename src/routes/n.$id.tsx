import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MarkdownEditor } from "~/components/editor/markdown-editor";
import { TitleEditor } from "~/components/editor/title-editor";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = Route.useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <TitleEditor value={title} onChange={setTitle} />

      <MarkdownEditor value={content} onChange={setContent} />
    </div>
  );
}
