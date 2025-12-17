import type { Note } from "~/types/note";

/**
 * Export a note to markdown format
 * @param note - The note to export
 * @returns The markdown content as a string
 */
export function exportNoteToMarkdown(note: Note): string {
  const title = note.title || "Untitled Note";
  const content = note.content || "";

  // Format: Title as H1, then content
  return `title: ${title}\n\n${content}`;
}

/**
 * Download a file with the given content and filename
 * @param content - The file content
 * @param filename - The filename for the download
 * @param mimeType - The MIME type of the file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
