import type { FC } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Eye, Edit } from "lucide-react";
import type { ViewMode } from "~/types/editor";

type Props = {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
};

const isValidViewMode = (value: string | undefined): value is ViewMode => {
  return value === "edit" || value === "split" || value === "preview";
};

export const ViewToggle: FC<Props> = ({ viewMode, setViewMode }) => {
  const handleValueChange = (value: string | undefined) => {
    if (isValidViewMode(value)) {
      setViewMode(value);
    }
  };

  return (
    <div className="flex items-center border-l border-border/50 pl-3">
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={handleValueChange}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="edit" aria-label="Edit">
          <Edit className="size-4" />
          Edit
        </ToggleGroupItem>

        <ToggleGroupItem value="split" aria-label="Split View">
          <Eye className="size-4" />
          Split
        </ToggleGroupItem>

        <ToggleGroupItem value="preview" aria-label="Preview">
          <Eye className="size-4" />
          Preview
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
