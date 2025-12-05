import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  const { id } = Route.useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Note</h1>
      <p className="text-lg text-gray-600">Note ID: {id}</p>
    </div>
  );
}
