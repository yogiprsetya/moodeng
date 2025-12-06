import { Cloud, CloudOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ThemeSetting } from "~/components/layout/theme-setting";
import { cn } from "~/utils/css";

type SyncStatus = "synced" | "syncing" | "error" | "offline";

export function Topbar() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="flex h-12 items-center justify-between gap-4 px-6">
        {/* Left: App title or branding */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            Moodeng
          </h1>
        </div>

        {/* Right: Theme selector, Sync button and sync alert */}
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
    </header>
  );
}
