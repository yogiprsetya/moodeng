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
import { useDataStore } from "~/stores/data-store";

interface AddFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFolderDialog({ open, onOpenChange }: AddFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { createCollection } = useDataStore();

  const handleCreate = async () => {
    if (!folderName.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      createCollection({
        name: folderName.trim(),
        deleted: false,
        syncStatus: "pending",
        icon: "",
        labelColor: "",
      });
      setFolderName("");
      onOpenChange(false);
    } catch (err) {
      console.error("Error creating folder:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFolderName("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>

          <DialogDescription>
            Enter a name for your new folder to organize your notes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && folderName.trim() && !isCreating) {
                handleCreate();
              }
            }}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
