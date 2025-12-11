import { useEffect, useState } from "react";
import { cn } from "~/utils/css";

interface TitleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleEditor({ value, onChange }: TitleEditorProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    onChange(localValue.trim() || "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(localValue.trim() || "");
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Untitled"
        className={cn(
          "w-full text-3xl font-semibold text-foreground tracking-tight",
          "bg-transparent border-none outline-none",
          "focus:ring-0 focus:outline-none",
          "placeholder:text-muted-foreground"
        )}
      />
    </div>
  );
}
