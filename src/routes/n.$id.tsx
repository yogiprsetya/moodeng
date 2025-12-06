import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/n/$id")({
  component: NotePage,
});

function NotePage() {
  const { id } = Route.useParams();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Note
        </h1>
        <p className="text-sm text-muted-foreground">Note ID: {id}</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-8 min-h-[400px] shadow-sm">
        <p className="text-muted-foreground">Start editing your note...</p>
      </div>
    </div>
  );
}
