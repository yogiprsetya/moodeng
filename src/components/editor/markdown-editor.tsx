import { useState, useRef, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
} from "lucide-react";
import { cn } from "~/utils/css";
import type { ViewMode } from "~/types/editor";
import { ViewToggle } from "./view-toggle";
import { ToolbarButtons } from "./toolbar-button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toolbar button configurations (no ref access here)
  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold",
      type: "text" as const,
      before: "**",
      after: "**",
    },
    {
      icon: Italic,
      label: "Italic",
      type: "text" as const,
      before: "_",
      after: "_",
    },
    { icon: Heading1, label: "Heading 1", type: "line" as const, prefix: "# " },
    {
      icon: Heading2,
      label: "Heading 2",
      type: "line" as const,
      prefix: "## ",
    },
    {
      icon: Heading3,
      label: "Heading 3",
      type: "line" as const,
      prefix: "### ",
    },
    { icon: List, label: "Bullet List", type: "line" as const, prefix: "- " },
    {
      icon: ListOrdered,
      label: "Numbered List",
      type: "line" as const,
      prefix: "1. ",
    },
    { icon: Quote, label: "Quote", type: "line" as const, prefix: "> " },
    {
      icon: Code,
      label: "Code",
      type: "text" as const,
      before: "`",
      after: "`",
    },
    {
      icon: Link,
      label: "Link",
      type: "text" as const,
      before: "[",
      after: "](url)",
    },
  ];

  // Create handlers - ref access happens only when handlers are called (in event handlers)
  const createTextHandler = useCallback(
    (before: string, after: string) => () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);

      const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos =
          start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  const createLineHandler = useCallback(
    (prefix: string) => () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lines = value.split("\n");
      let currentLine = 0;
      let charCount = 0;

      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= start) {
          currentLine = i;
          break;
        }
        charCount += lines[i].length + 1;
      }

      lines[currentLine] = prefix + lines[currentLine];
      const newText = lines.join("\n");
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + prefix.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  const handlers = useMemo(
    () => ({
      Bold: createTextHandler("**", "**"),
      Italic: createTextHandler("_", "_"),
      "Heading 1": createLineHandler("# "),
      "Heading 2": createLineHandler("## "),
      "Heading 3": createLineHandler("### "),
      "Bullet List": createLineHandler("- "),
      "Numbered List": createLineHandler("1. "),
      Quote: createLineHandler("> "),
      Code: createTextHandler("`", "`"),
      Link: createTextHandler("[", "](url)"),
    }),
    [createTextHandler, createLineHandler]
  );

  return (
    <div className="flex flex-col border border-border/50 rounded-xl bg-card overflow-hidden">
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
              className="flex-1 w-full p-6 resize-none outline-none bg-background text-foreground font-mono leading-relaxed"
              style={{ minHeight: "400px" }}
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
