export type SyncStatus = "pending" | "synced" | "conflicted";

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  syncStatus: SyncStatus;
  icon: string;
  labelColor: string;
  isPinned: boolean;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  syncStatus: SyncStatus;
  icon: string;
  labelColor: string;
}
