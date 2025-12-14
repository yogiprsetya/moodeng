import { useMemo, useCallback } from "react";
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
  {
    icon: Heading1,
    label: "Heading 1",
    type: "line" as const,
    prefix: "# ",
  },
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

export function useToolbar(
  value: string,
  onChange: (value: string) => void,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) {
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

      // Check if the selected text is already wrapped with the formatting markers
      // Case 1: Selection is within formatted text (markers are outside selection)
      const textBeforeSelection = value.substring(
        Math.max(0, start - before.length),
        start
      );
      const textAfterSelection = value.substring(
        end,
        Math.min(value.length, end + after.length)
      );
      const isWrappedInMarkers =
        textBeforeSelection === before && textAfterSelection === after;

      // Case 2: Selection includes the markers (selection starts and ends with markers)
      const startsWithMarker = selectedText.startsWith(before);
      const endsWithMarker = selectedText.endsWith(after);
      const isSelectionIncludingMarkers =
        selectedText.length >= before.length + after.length &&
        startsWithMarker &&
        endsWithMarker;

      const isAlreadyFormatted =
        isWrappedInMarkers || isSelectionIncludingMarkers;

      let newText: string;
      let newStart: number;
      let newEnd: number;

      if (isAlreadyFormatted) {
        // Remove formatting
        if (isWrappedInMarkers) {
          // Markers are outside the selection
          const textBeforeBefore = value.substring(0, start - before.length);
          const textAfterAfter = value.substring(end + after.length);
          newText = `${textBeforeBefore}${selectedText}${textAfterAfter}`;
          newStart = start - before.length;
          newEnd = end - before.length;
        } else {
          // Markers are inside the selection
          const textWithoutMarkers = selectedText.substring(
            before.length,
            selectedText.length - after.length
          );
          newText = `${beforeText}${textWithoutMarkers}${afterText}`;
          newStart = start;
          newEnd = start + textWithoutMarkers.length;
        }
      } else {
        // Add formatting
        newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
        newStart = start;
        newEnd = start + before.length + selectedText.length + after.length;
      }

      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }, 0);
    },
    [value, onChange, textareaRef]
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
    [value, onChange, textareaRef]
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

  return { toolbarButtons, handlers };
}
