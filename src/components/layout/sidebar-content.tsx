import { Link, useParams } from "@tanstack/react-router";
import { Search, Folder } from "lucide-react";
import { useMemo, useState } from "react";
import {
  SidebarContent as SidebarContentWrapper,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export function SidebarContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Get current note ID from route params if on note page
  const params = useParams({ strict: false });
  const currentNoteId = params?.id;

  // TODO: Replace with actual notes data from store/API
  const notes = useMemo(() => {
    // Mock data for now
    return [
      { id: "1", title: "Welcome Note", folder: null },
      { id: "2", title: "Meeting Notes", folder: "work" },
      { id: "3", title: "Personal Thoughts", folder: "personal" },
    ];
  }, []);

  const folders = useMemo(() => {
    const uniqueFolders = Array.from(
      new Set(notes.map((note) => note.folder).filter(Boolean))
    );
    return uniqueFolders as string[];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = !selectedFolder || note.folder === selectedFolder;
      return matchesSearch && matchesFolder;
    });
  }, [notes, searchQuery, selectedFolder]);

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
            {filteredNotes.length === 0 ? (
              <div className="px-3 py-6 text-center text-muted-foreground">
                {searchQuery || selectedFolder
                  ? "No notes found"
                  : "No notes yet"}
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
                      <span className="truncate font-normal">{note.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContentWrapper>
  );
}
