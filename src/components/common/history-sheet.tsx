import { useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useHistories } from "~/services/use-histories";
import type { History } from "~/types/history";
import { cn } from "~/utils/css";

function formatTime(ts: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function typeLabel(type: string) {
  switch (type) {
    case "created":
      return "Created";
    case "updated":
      return "Updated";
    case "moved":
      return "Moved";
    case "deleted":
      return "Deleted";
    case "restored":
      return "Restored";
    default:
      return type;
  }
}

function eventDescription(history: History) {
  if (history.type === "updated") {
    const payload = history.payload as { updates?: Record<string, unknown> };
    const updates = payload?.updates ?? {};

    const changedTitle = typeof updates.title !== "undefined";
    const changedContent = typeof updates.content !== "undefined";

    if (changedTitle && !changedContent) return "Title updated";
    if (!changedTitle && changedContent) return "Content updated";
    if (changedTitle && changedContent) return "Title + content updated";

    return "Fields updated";
  }

  const map: Record<string, string> = {
    moved: "Folder changed",
    created: "Note created",
    deleted: "Note deleted",
    restored: "Note restored",
  };

  return map[history.type] ?? "Event";
}

export function HistorySheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const params = useParams({ strict: false });
  const noteId = params?.id as string | undefined;

  const { histories, isLoading } = useHistories({ noteId, limit: 200 });

  const emptyText = useMemo(() => {
    if (!noteId) return "Open a note to see its history.";
    if (isLoading) return "Loading history...";
    return "No history yet.";
  }, [noteId, isLoading]);

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="size-4" />
            History
          </SheetTitle>

          <SheetDescription>
            {noteId ? "Recent changes for this note." : "Recent changes."}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {histories.length === 0 ? (
              <div className="text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              histories.map((h) => (
                <div
                  key={h.id}
                  className={cn(
                    "rounded-md border p-3",
                    h.type === "deleted" && "opacity-80"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">
                      {typeLabel(h.type)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatTime(h.createdAt)}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {eventDescription(h)}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
