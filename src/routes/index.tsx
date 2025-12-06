import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-5xl font-semibold mb-4 text-foreground/90 tracking-tight">
        Welcome to Moodeng
      </h1>
      <p className="text-lg text-muted-foreground max-w-md">
        A beautiful note-taking app inspired by Apple Notes. Start creating your
        notes today.
      </p>
    </div>
  );
}
