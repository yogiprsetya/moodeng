import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "~/utils/css";
import type { ViewMode } from "~/types/editor";
import { ViewToggle } from "./view-toggle";
import { ToolbarButtons } from "./toolbar-button";
import { useToolbar } from "./use-toolbar";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { toolbarButtons, handlers } = useToolbar(value, onChange, textareaRef);

  return (
    <div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2">
        <ToolbarButtons buttons={toolbarButtons} handlers={handlers} />
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
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Start writing ..."
              className="flex-1 w-full p-6 resize-none outline-none bg-background text-foreground leading-relaxed"
              style={{ minHeight: "550px" }}
            />
          </div>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={cn(
              "flex-1 overflow-auto",
              viewMode === "split" && "bg-muted/20"
            )}
          >
            <div className="p-6 prose max-w-none">
              {value.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
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
