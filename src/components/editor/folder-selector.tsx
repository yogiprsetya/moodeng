import { Folder } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { useDataStore } from "~/stores/data-store";
import { Button } from "../ui/button";

interface FolderSelectorProps {
  value: string | null;
  onChange: (folderId: string | null) => void;
}

export function FolderSelector({ value, onChange }: FolderSelectorProps) {
  const { collections, isLoadingCollections: isLoading } = useDataStore();

  const selectedCollection = collections.find((c) => c.id === value);

  const handleSelect = (folderId: string | null) => {
    onChange(folderId);
  };

  return (
    <div className="mb-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Folder className="size-4" />
            <span className="truncate">
              {selectedCollection ? selectedCollection.name : "No folder"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSelect(null)}>
            <Folder className="size-4" />
            <span>No folder</span>
            {value === null && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>

          {collections.length > 0 && <DropdownMenuSeparator />}

          {isLoading ? (
            <DropdownMenuItem disabled>Loading folders...</DropdownMenuItem>
          ) : (
            collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => handleSelect(collection.id)}
              >
                <Folder className="size-4" />
                <span className="truncate">{collection.name}</span>
                {value === collection.id && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
