import { useMemo, useEffect, useRef } from "react";
import { useParams } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { handleError } from "~/utils/error-handle";
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

const HISTORY_LIMIT = 200;

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

  const histories = useDataStore((state) => state.histories);
  const isLoading = useDataStore((state) => state.isLoadingHistories);
  const loadHistories = useDataStore((state) => state.loadHistories);

  // Only track the updatedAt value, not the entire object
  // This avoids unstable object references in useEffect dependencies
  const currentNoteUpdatedAt = useDataStore((state) =>
    noteId ? state.notes.find((n) => n.id === noteId)?.updatedAt : undefined
  );

  // For recent histories, compute signature in selector to avoid watching entire array
  // This is more efficient than watching the entire notes array
  const notesSignature = useDataStore((state) => {
    if (noteId) return null; // Not needed for specific note view
    const notes = state.notes;
    const count = notes.length;
    const maxUpdatedAt =
      notes.length > 0 ? Math.max(...notes.map((n) => n.updatedAt)) : 0;
    return `${count}-${maxUpdatedAt}`;
  });

  // Track the last updatedAt we've seen to avoid unnecessary reloads
  const lastUpdatedAtRef = useRef<number | null>(null);
  const lastNotesSignatureRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);
  const lastNoteIdRef = useRef<string | undefined>(undefined);

  // Effect 1: Handle initialization and reset when sheet opens/closes or noteId changes
  useEffect(() => {
    if (!props.open) {
      // Reset tracking when sheet closes
      lastUpdatedAtRef.current = null;
      lastNotesSignatureRef.current = null;
      hasInitializedRef.current = false;
      lastNoteIdRef.current = undefined;
      return;
    }

    // Only reload if noteId actually changed or sheet just opened
    const noteIdChanged = lastNoteIdRef.current !== noteId;
    const shouldInitialize = noteIdChanged || !hasInitializedRef.current;
    lastNoteIdRef.current = noteId;

    if (shouldInitialize) {
      // Load histories when sheet opens or noteId changes
      loadHistories(noteId, HISTORY_LIMIT).catch(handleError);
      hasInitializedRef.current = true;

      // Initialize tracking refs with current values (used for initialization only)
      if (currentNoteUpdatedAt !== undefined) {
        lastUpdatedAtRef.current = currentNoteUpdatedAt;
      } else {
        lastUpdatedAtRef.current = null;
      }

      if (!noteId && notesSignature !== null) {
        lastNotesSignatureRef.current = notesSignature;
      }
    }
    // currentNoteUpdatedAt and notesSignature are intentionally excluded - we only
    // use them for initialization, not as triggers for this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, noteId, loadHistories]);

  // Effect 2: Handle updates after initialization (note updates or recent histories changes)
  useEffect(() => {
    if (!props.open || !hasInitializedRef.current) return;

    // Handle specific note updates
    if (noteId && currentNoteUpdatedAt !== undefined) {
      const lastUpdatedAt = lastUpdatedAtRef.current;
      if (lastUpdatedAt !== null && currentNoteUpdatedAt !== lastUpdatedAt) {
        loadHistories(noteId, HISTORY_LIMIT).catch(handleError);
        lastUpdatedAtRef.current = currentNoteUpdatedAt;
      }
    }

    // Handle recent histories updates
    if (!noteId && notesSignature !== null) {
      if (lastNotesSignatureRef.current !== notesSignature) {
        loadHistories(undefined, HISTORY_LIMIT).catch(handleError);
        lastNotesSignatureRef.current = notesSignature;
      }
    }
  }, [props.open, noteId, loadHistories, currentNoteUpdatedAt, notesSignature]);

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
