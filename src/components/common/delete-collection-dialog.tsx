import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Checkbox } from "~/components/ui/checkbox";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (cascadeDelete: boolean) => void;
  collectionName?: string;
  noteCount?: number;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  collectionName,
  noteCount = 0,
}: DeleteCollectionDialogProps) {
  const [cascadeDelete, setCascadeDelete] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when dialog closes
      setCascadeDelete(false);
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    onConfirmDelete(cascadeDelete);
    handleOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Collection</AlertDialogTitle>

          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete{" "}
              {collectionName ? (
                <strong>&quot;{collectionName}&quot;</strong>
              ) : (
                "this collection"
              )}
              ? This action cannot be undone.
            </p>

            {noteCount > 0 && (
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="cascade-delete"
                    checked={cascadeDelete}
                    onCheckedChange={(checked) =>
                      setCascadeDelete(checked === true)
                    }
                  />
                  <label
                    htmlFor="cascade-delete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    CASCADE: Delete all {noteCount} note
                    {noteCount !== 1 ? "s" : ""} in this collection
                  </label>
                </div>
                {cascadeDelete ? (
                  <p className="text-xs text-muted-foreground pl-6">
                    <strong>CASCADE mode:</strong> All notes in this collection
                    will be permanently deleted along with the collection.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground pl-6">
                    <strong>SET NULL mode:</strong> Notes will be moved to the
                    root folder (folderId set to null). The notes themselves
                    will not be deleted.
                  </p>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleConfirm} variant="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
