import type { SyncStatus } from "./note";

export type HistoryType =
  | "created"
  | "updated"
  | "moved"
  | "deleted"
  | "restored";

export interface History {
  id: string;
  noteId: string;
  type: HistoryType;
  payload: Record<string, unknown>;
  createdAt: number;
  deleted: boolean;
  syncStatus: SyncStatus;
}
