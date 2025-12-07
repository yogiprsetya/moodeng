import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "~/components/editor";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = Route.useParams();

  return <Editor />;
}
