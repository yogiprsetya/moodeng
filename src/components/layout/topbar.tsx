import { Cloud, CloudCheck, SidebarIcon } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "~/components/ui/menubar";
import { useNotes } from "~/services/use-notes";
import { ThemeSetting } from "./theme-setting";
import { useEditorStore } from "~/stores/editor-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { useWorkspace } from "~/services/use-workspace";
import { ButtonGroup } from "../ui/button-group";
import { useState, lazy, Suspense, useCallback } from "react";
import { useParams } from "@tanstack/react-router";
import { exportNoteAsMarkdown } from "~/utils/export-note";
import { toast } from "sonner";

const SettingsDialog = lazy(() =>
  import("../common/settings-dialog").then((module) => ({
    default: module.SettingsDialog,
  }))
);

export function Topbar() {
  const { syncStatus } = useEditorStore();
  const { handleCreateNewNote } = useNotes();
  const { toggleSidebar } = useSidebar();
  const { workspace, refetch: refetchWorkspace } = useWorkspace();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Get current note ID from route params (if on note page)
  const params = useParams({ strict: false });
  const noteId = params?.id as string | undefined;

  const handleExportMarkdown = useCallback(async () => {
    if (!noteId) {
      toast.error("No note selected. Please open a note to export.");
      return;
    }
    try {
      await exportNoteAsMarkdown(noteId);
      toast.success("Note exported as Markdown");
    } catch (error) {
      toast.error("Failed to export note");
      console.error("Export error:", error);
    }
  }, [noteId]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="flex h-12 items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full">
          {/* Left: Workspace title | toolbar (new notes) */}
          <div className="w-64 flex items-center justify-between">
            <div className="flex items-center gap-1 pl-4">
              <img src="/logo.svg" alt="Moodeng" className="size-5" />

              <p className="text-xs font-semibold">
                {workspace?.title || "Moodeng"}
              </p>
            </div>

            <Button size="icon" variant="ghost" onClick={toggleSidebar}>
              <SidebarIcon className="size-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>

          {/* Right: Sync button and sync alert */}
          <div className="flex flex-1 items-center justify-between px-4">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>

                <MenubarContent>
                  <MenubarItem onClick={() => handleCreateNewNote(null)}>
                    New Text Note
                  </MenubarItem>

                  <MenubarItem onClick={() => handleCreateNewNote(null)}>
                    New Folder Collection
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Export</MenubarTrigger>

                <MenubarContent>
                  <MenubarItem
                    onClick={handleExportMarkdown}
                    disabled={!noteId}
                  >
                    Markdown Format (.md)
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Setting</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => setSettingsOpen(true)}>
                    Workspace Settings
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>

            <ButtonGroup>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-sm">
                    Sync
                  </Button>
                </TooltipTrigger>

                <TooltipContent align="end" side="bottom">
                  Sync your local data from the cloud.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-sm">
                    Backup
                  </Button>
                </TooltipTrigger>

                <TooltipContent align="start" side="bottom">
                  Data on your device, not automatically <br />
                  uploaded to the cloud.
                </TooltipContent>
              </Tooltip>
            </ButtonGroup>

            <div className="flex items-center gap-2">
              <Tooltip open={syncStatus === "saving"}>
                <TooltipTrigger disabled asChild>
                  {syncStatus === "saving" ? (
                    <Cloud className="size-4.5 animate-pulse" />
                  ) : (
                    <CloudCheck className="size-4" />
                  )}
                </TooltipTrigger>

                <TooltipContent align="center" side="right">
                  Saving...
                </TooltipContent>
              </Tooltip>

              <ThemeSetting />
            </div>
          </div>
        </div>
      </div>

      {workspace?.title && (
        <Suspense fallback={null}>
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            currentTitle={workspace.title}
            onSave={refetchWorkspace}
          />
        </Suspense>
      )}
    </header>
  );
}
