import { useMemo, useEffect, useRef } from "react";
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
import { useDataStore } from "~/stores/data-store";
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

  const {
    histories,
    isLoadingHistories: isLoading,
    loadHistories,
    notes,
  } = useDataStore();

  // Get the current note to watch for updates
  const currentNote = noteId ? notes.find((n) => n.id === noteId) : null;

  // Track the last updatedAt we've seen to avoid unnecessary reloads
  const lastUpdatedAtRef = useRef<number | null>(null);
  const lastNotesSignatureRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Reload histories when sheet opens or noteId changes
  useEffect(() => {
    if (!props.open) {
      // Reset tracking when sheet closes
      lastUpdatedAtRef.current = null;
      lastNotesSignatureRef.current = null;
      hasInitializedRef.current = false;
      return;
    }

    // Load histories when sheet opens or noteId changes
    loadHistories(noteId, 200);
    hasInitializedRef.current = true;

    // Initialize tracking for current note if available
    if (currentNote) {
      lastUpdatedAtRef.current = currentNote.updatedAt;
    } else {
      lastUpdatedAtRef.current = null;
    }
  }, [props.open, noteId, loadHistories, currentNote]);

  // Reload histories when the current note is updated (only after initial load)
  useEffect(() => {
    if (!props.open || !hasInitializedRef.current) return;

    if (currentNote) {
      const currentUpdatedAt = currentNote.updatedAt;
      const lastUpdatedAt = lastUpdatedAtRef.current;

      // Only reload if updatedAt has actually changed
      if (lastUpdatedAt !== null && currentUpdatedAt !== lastUpdatedAt) {
        loadHistories(noteId, 200);
        lastUpdatedAtRef.current = currentUpdatedAt;
      }
    }
  }, [props.open, noteId, loadHistories, currentNote]);

  // For recent histories (no noteId), reload when any note changes
  useEffect(() => {
    if (!props.open || noteId) return;

    // Watch for changes in notes array (new notes, updates, etc.)
    // We'll reload recent histories when notes change
    const notesCount = notes.length;
    const maxUpdatedAt = Math.max(...notes.map((n) => n.updatedAt), 0);

    // Use a combination of count and max updatedAt to detect changes
    const notesSignature = `${notesCount}-${maxUpdatedAt}`;

    if (lastNotesSignatureRef.current !== notesSignature) {
      loadHistories(undefined, 200);
      lastNotesSignatureRef.current = notesSignature;
    }
  }, [props.open, noteId, notes, loadHistories]);

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

        <ScrollArea className="h-[calc(100%-128px)]">
          <div className="p-4 space-y-3 pb-6">
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
