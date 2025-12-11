import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "~/components/editor";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  return <Editor />;
}
