import { Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Folder,
  NotebookText,
  Plus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useMemo, useState, lazy, Suspense } from "react";
import {
  SidebarContent as SidebarContentWrapper,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { useNotes } from "~/services/use-notes";
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

export function SidebarContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get current note ID from route params if on note page
  const params = useParams({ strict: false });
  const currentNoteId = params?.id;

  const { notes, isLoading, handleCreateNewNote, handleDeleteNote } =
    useNotes();

  const folders = useMemo(() => {
    const uniqueFolders = Array.from(
      new Set(notes.map((note) => note.folderId).filter(Boolean))
    );
    return uniqueFolders as string[];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = !selectedFolder || note.folderId === selectedFolder;
      return matchesSearch && matchesFolder;
    });
  }, [notes, searchQuery, selectedFolder]);

  const noteToDelete = useMemo(() => {
    return deleteNoteId ? notes.find((note) => note.id === deleteNoteId) : null;
  }, [notes, deleteNoteId]);

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

  return (
    <SidebarContentWrapper>
      <SidebarGroup className="mt-4">
        <SidebarGroupContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <SidebarInput
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Folders</SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSelectedFolder(null)}
                isActive={selectedFolder === null}
              >
                <Folder className="size-4" />
                <span>All Notes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {folders.map((folder) => (
              <SidebarMenuItem key={folder}>
                <SidebarMenuButton
                  onClick={() => setSelectedFolder(folder)}
                  isActive={selectedFolder === folder}
                >
                  <Folder className="size-4" />
                  <span>{folder}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Notes</SidebarGroupLabel>

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
                      <DropdownMenuItem>
                        <NotebookText />
                        <span>Read-only view</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setDeleteNoteId(note.id)}
                        variant="destructive"
                      >
                        <Trash2 />
                        <span>Delete Notes</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Suspense fallback={null}>
        <DeleteNoteDialog
          open={deleteNoteId !== null}
          onOpenChange={(open) => !open && setDeleteNoteId(null)}
          onConfirmDelete={handleConfirmDelete}
          noteTitle={noteToDelete?.title}
        />
      </Suspense>
    </SidebarContentWrapper>
  );
}
