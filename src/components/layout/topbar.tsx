import { Cloud, CloudCheck } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { useNotes } from "~/services/use-notes";
import { ThemeSetting } from "./theme-setting";
import { useEditorStore } from "~/stores/editor-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Topbar() {
  const { syncStatus } = useEditorStore();
  const { handleCreateNewNote } = useNotes();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="flex h-12 items-center justify-between gap-4 px-6">
        <div className="flex items-center justify-between w-full">
          {/* Left: Workspace title | toolbar (new notes) */}
          <NavigationMenu>
            <NavigationMenuList className="flex-wrap">
              <NavigationMenuItem>
                <NavigationMenuTrigger>File</NavigationMenuTrigger>

                <NavigationMenuContent>
                  <ul className="grid w-44 gap-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <button onClick={() => handleCreateNewNote(null)}>
                          New Text Note
                        </button>
                      </NavigationMenuLink>

                      <NavigationMenuLink asChild>
                        <button onClick={() => handleCreateNewNote(null)}>
                          New Folder Collection
                        </button>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right: Sync button and sync alert */}
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
    </header>
  );
}
