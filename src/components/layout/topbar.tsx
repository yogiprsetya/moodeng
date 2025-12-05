import { Cloud, CloudOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/utils/css";

type SyncStatus = "synced" | "syncing" | "error" | "offline";

export function Topbar() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        {/* Toolbar - can be extended with more tools */}
        <div className="ml-auto flex items-center gap-2">
          {/* Toolbar items will go here */}
        </div>

        {/* Right: Sync button and sync alert */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implement sync logic
              setSyncStatus("syncing");
              setTimeout(() => setSyncStatus("synced"), 2000);
            }}
            disabled={syncStatus === "syncing"}
          >
            {syncStatus === "syncing" ? (
              <Cloud className="h-4 w-4 animate-pulse" />
            ) : syncStatus === "offline" ? (
              <CloudOff className="h-4 w-4" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            <span className="sr-only">Sync</span>
          </Button>
          {syncStatus === "error" && (
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
                "bg-destructive/10 text-destructive"
              )}
            >
              <AlertCircle className="h-3 w-3" />
              <span>Sync failed</span>
            </div>
          )}
          {syncStatus === "syncing" && (
            <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground">
              <span>Syncing...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
