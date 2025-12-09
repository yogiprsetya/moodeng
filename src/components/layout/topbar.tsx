import { Cloud, CloudOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { cn } from "~/utils/css";
import { useNotes } from "~/services/use-notes";
import { ThemeSetting } from "./theme-setting";

type SyncStatus = "synced" | "syncing" | "error" | "offline";

export function Topbar() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
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
            <ThemeSetting />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => {
                // TODO: Implement sync logic
                setSyncStatus("syncing");
                setTimeout(() => setSyncStatus("synced"), 2000);
              }}
              disabled={syncStatus === "syncing"}
            >
              {syncStatus === "syncing" ? (
                <Cloud className="size-4 animate-pulse" />
              ) : syncStatus === "offline" ? (
                <CloudOff className="size-4" />
              ) : (
                <Cloud className="size-4" />
              )}
              <span className="sr-only">Sync</span>
            </Button>

            {syncStatus === "error" && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs",
                  "bg-destructive/10 text-destructive border border-destructive/20 shadow-sm"
                )}
              >
                <AlertCircle className="size-3" />
                <span>Sync failed</span>
              </div>
            )}

            {syncStatus === "syncing" && (
              <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-muted-foreground">
                <span>Syncing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
