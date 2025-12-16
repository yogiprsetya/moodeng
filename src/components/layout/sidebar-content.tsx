import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { Folder, Plus, MoreHorizontal, Pin, PinOff } from "lucide-react";
import { useMemo, useState, lazy, Suspense } from "react";
import {
  SidebarContent as SidebarContentWrapper,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { SearchField } from "~/components/ui/search-field";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useNotes } from "~/services/use-notes";
import { useFetchCollections } from "~/services/use-fetch-collections";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const DeleteNoteDialog = lazy(() =>
  import("../common/delete-note-dialog").then((m) => ({
    default: m.DeleteNoteDialog,
  }))
);

const DeleteCollectionDialog = lazy(() =>
  import("../common/delete-collection-dialog").then((m) => ({
    default: m.DeleteCollectionDialog,
  }))
);

const AddFolderDialog = lazy(() =>
  import("../common/add-folder").then((m) => ({
    default: m.AddFolderDialog,
  }))
);

export function SidebarContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(
    null
  );
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const navigate = useNavigate();

  // Get current note ID from route params if on note page
  const params = useParams({ strict: false });
  const currentNoteId = params?.id;

  const {
    notes,
    isLoading,
    handleCreateNewNote,
    handleDeleteNote,
    handleTogglePin,
    refetch,
  } = useNotes();

  const {
    collections,
    isLoading: isLoadingCollections,
    refetch: refetchCollections,
  } = useFetchCollections();

  const filteredNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = !selectedFolder || note.folderId === selectedFolder;
      return matchesSearch && matchesFolder;
    });

    // Sort: pinned notes first, then by updatedAt (most recent first)
    return filtered.sort((a, b) => {
      // Pinned notes come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Within same pin status, sort by updatedAt (most recent first)
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, searchQuery, selectedFolder]);

  const noteToDelete = useMemo(() => {
    return deleteNoteId ? notes.find((note) => note.id === deleteNoteId) : null;
  }, [notes, deleteNoteId]);

  const collectionToDelete = useMemo(() => {
    return deleteCollectionId
      ? collections.find((c) => c.id === deleteCollectionId)
      : null;
  }, [collections, deleteCollectionId]);

  const collectionNoteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    collections.forEach((collection) => {
      counts[collection.id] = notes.filter(
        (note) => note.folderId === collection.id
      ).length;
    });
    return counts;
  }, [collections, notes]);

  const handleConfirmDelete = async () => {
    if (!deleteNoteId) return;

    await handleDeleteNote(deleteNoteId);

    // Navigate away if we're currently viewing the deleted note
    if (currentNoteId === deleteNoteId) {
      const remainingNotes = notes.filter((note) => note.id !== deleteNoteId);
      if (remainingNotes.length > 0) {
        navigate({ to: "/n/$id", params: { id: remainingNotes[0].id } });
      } else {
        navigate({ to: "/" });
      }
    }

    setDeleteNoteId(null);
  };

  const handleConfirmDeleteCollection = async (cascadeDelete: boolean) => {
    if (!deleteCollectionId) return;

    const { db } = await import("~/api/browser/db");
    await db.deleteCollectionWithNotes(deleteCollectionId, cascadeDelete);

    // If we're viewing a note in this collection and cascade delete is true, navigate away
    if (cascadeDelete && currentNoteId) {
      const currentNote = notes.find((note) => note.id === currentNoteId);
      if (currentNote?.folderId === deleteCollectionId) {
        const remainingNotes = notes.filter(
          (note) => note.folderId !== deleteCollectionId
        );
        if (remainingNotes.length > 0) {
          navigate({ to: "/n/$id", params: { id: remainingNotes[0].id } });
        } else {
          navigate({ to: "/" });
        }
      }
    }

    // If the deleted collection was selected, clear selection
    if (selectedFolder === deleteCollectionId) {
      setSelectedFolder(null);
    }

    setDeleteCollectionId(null);
    refetchCollections();
    refetch();
  };

  return (
    <SidebarContentWrapper>
      <SidebarGroup className="mt-4">
        <SidebarGroupContent>
          <SearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="justify-between pr-0">
          <span>Folders</span>

          <Button
            size="icon"
            variant="ghost"
            title="Create new folder"
            onClick={() => setIsAddFolderOpen(true)}
          >
            <Plus />
          </Button>
        </SidebarGroupLabel>

        <ScrollArea className="max-h-32">
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoadingCollections ? (
                <SidebarMenuItem>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Loading folders...
                  </div>
                </SidebarMenuItem>
              ) : (
                collections.map((collection) => (
                  <SidebarMenuItem key={collection.id}>
                    <SidebarMenuButton
                      onClick={() => setSelectedFolder(collection.id)}
                      isActive={selectedFolder === collection.id}
                    >
                      <Folder className="size-4" />
                      <span>{collection.name}</span>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          onClick={() => handleCreateNewNote(collection.id)}
                        >
                          Add Notes to Collection
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setDeleteCollectionId(collection.id)}
                          variant="destructive"
                        >
                          Delete Collection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))
              )}

              {collections.length === 0 && (
                <SidebarMenuItem>
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No folders found
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </ScrollArea>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Notes</SidebarGroupLabel>

        <ScrollArea className="max-h-96">
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-3 py-6 text-center text-muted-foreground">
                  Loading notes...
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <Button
                    onClick={() => handleCreateNewNote(selectedFolder)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="size-4" />
                    New Note
                  </Button>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <SidebarMenuItem key={note.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentNoteId === note.id}
                      tooltip={note.title}
                    >
                      <Link to="/n/$id" params={{ id: note.id }}>
                        {note.isPinned && (
                          <Pin className="shrink-0" fill="currentColor" />
                        )}
                        <span className="truncate">{note.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          onClick={() => handleTogglePin(note.id)}
                        >
                          {note.isPinned ? (
                            <PinOff />
                          ) : (
                            <Pin className="size-4" />
                          )}
                          {note.isPinned ? "Unpin Note" : "Pin Note"}
                        </DropdownMenuItem>

                        <DropdownMenuItem>Read-only view</DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setDeleteNoteId(note.id)}
                          variant="destructive"
                        >
                          Delete Notes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </ScrollArea>
      </SidebarGroup>

      <Suspense fallback={null}>
        <DeleteNoteDialog
          open={deleteNoteId !== null}
          onOpenChange={(open) => !open && setDeleteNoteId(null)}
          onConfirmDelete={handleConfirmDelete}
          noteTitle={noteToDelete?.title}
        />

        <DeleteCollectionDialog
          open={deleteCollectionId !== null}
          onOpenChange={(open) => !open && setDeleteCollectionId(null)}
          onConfirmDelete={handleConfirmDeleteCollection}
          collectionName={collectionToDelete?.name}
          noteCount={
            collectionToDelete
              ? (collectionNoteCounts[collectionToDelete.id] ?? 0)
              : 0
          }
        />

        <AddFolderDialog
          open={isAddFolderOpen}
          onOpenChange={setIsAddFolderOpen}
          onFolderCreated={() => {
            // Refresh collections and notes
            refetchCollections();
            refetch();
          }}
        />
      </Suspense>
    </SidebarContentWrapper>
  );
}
