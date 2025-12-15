import { useEffect, useState } from "react";
import { cn } from "~/utils/css";
import { usePrevious } from "~/hooks/use-previous";

interface TitleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleEditor({ value, onChange }: TitleEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const previousValue = usePrevious(value);

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    const trimmedValue = localValue.trim() || "";
    // Only trigger onChange if the value has changed (dirty)
    if (trimmedValue !== previousValue) {
      onChange(trimmedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(localValue.trim() || "");
    }
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="Untitled"
      className={cn(
        "w-full text-3xl font-semibold text-foreground tracking-tight block",
        "bg-transparent border-none outline-none",
        "focus:ring-0 focus:outline-none",
        "placeholder:text-muted-foreground"
      )}
    />
  );
}
