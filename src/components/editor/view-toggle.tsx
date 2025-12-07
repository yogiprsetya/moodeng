import type { FC } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Edit, SquareSplitHorizontal, BookOpen } from "lucide-react";
import type { ViewMode } from "~/types/editor";

type Props = {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
};

const isValidViewMode = (value: string | undefined): value is ViewMode => {
  return value === "edit" || value === "split" || value === "read-only";
};

export const ViewToggle: FC<Props> = ({ viewMode, setViewMode }) => {
  const handleValueChange = (value: string | undefined) => {
    if (isValidViewMode(value)) {
      setViewMode(value);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={handleValueChange}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="edit" aria-label="Edit">
        <Edit className="size-4" />
      </ToggleGroupItem>

      <ToggleGroupItem value="split" aria-label="Split View">
        <SquareSplitHorizontal className="size-4" />
      </ToggleGroupItem>

      <ToggleGroupItem value="read-only" aria-label="read">
        <BookOpen className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
