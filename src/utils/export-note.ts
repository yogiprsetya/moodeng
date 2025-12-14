import type { Note } from "~/types/note";
import { db } from "~/api/browser/db";

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

/**
 * Export a note to markdown file and trigger download
 * Fetches the latest version of the note from the database
 * @param noteId - The ID of the note to export
 */
export async function exportNoteAsMarkdown(noteId: string): Promise<void> {
  const note = await db.getNote(noteId);

  if (!note) {
    throw new Error("Note not found");
  }

  const markdown = exportNoteToMarkdown(note);
  const filename = `${sanitizeFilename(note.title || "Untitled Note")}.md`;
  downloadFile(markdown, filename, "text/markdown");
}

/**
 * Sanitize a filename by removing invalid characters
 * @param filename - The filename to sanitize
 * @returns The sanitized filename
 */
function sanitizeFilename(filename: string): string {
  // Remove invalid characters for filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 100); // Limit length
}
