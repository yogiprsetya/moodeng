import { useRef, useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "~/utils/css";
import { ViewToggle } from "./view-toggle";
import { ToolbarButtons } from "./toolbar-button";
import { useToolbar } from "./use-toolbar";
import { useEditorStore } from "~/stores/editor-store";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const { viewMode, setViewMode } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);

  // Debounced onChange callback - triggers after 2 seconds of inactivity
  const debouncedOnChange = useDebouncedCallback(onChange, 2000);

  // Sync local value when prop changes externally (e.g., when note is loaded)
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const { toolbarButtons, handlers } = useToolbar(
    localValue,
    handleChange,
    textareaRef
  );

  return (
    <div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2">
        <ToolbarButtons
          buttons={toolbarButtons}
          handlers={handlers}
          disabled={viewMode === "read-only"}
        />
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Editor/Preview Area */}
      <div className="flex flex-1 overflow-hidden">
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={cn(
              "flex-1 flex flex-col",
              viewMode === "split" && "border-r border-border/50"
            )}
          >
            <textarea
              ref={textareaRef}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Start writing ..."
              className="flex-1 w-full p-6 min-h-[550px] resize-none outline-none bg-background text-foreground leading-relaxed"
            />
          </div>
        )}

        {(viewMode === "read-only" || viewMode === "split") && (
          <div
            className={cn(
              "flex-1 overflow-auto",
              viewMode === "split" && "bg-muted/20"
            )}
          >
            <div className="p-6 prose max-w-none">
              {localValue.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="min-h-[550px]"
                >
                  {localValue}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">
                  Start writing ...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
