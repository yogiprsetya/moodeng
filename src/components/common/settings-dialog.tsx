import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useWorkspace } from "~/services/use-workspace";
import { Label } from "../ui/label";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onSave: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  currentTitle,
  onSave,
}: SettingsDialogProps) {
  const { workspace, updateWorkspace } = useWorkspace();
  const [title, setTitle] = useState(currentTitle);

  const handleSave = async () => {
    if (!workspace) return;

    await updateWorkspace({ title: title.trim() || "Moodeng" });
    onOpenChange(false);
    onSave();
  };

  const handleCancel = () => {
    // Reset to original value
    if (workspace) {
      setTitle(workspace.title || "");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your workspace settings and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-title">Workspace Title</Label>

            <Input
              id="workspace-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter workspace title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
                if (e.key === "Escape") {
                  handleCancel();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
