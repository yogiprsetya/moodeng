import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViewMode } from "~/types/editor";

const STORAGE_KEY = "moodeng-editor";

type SyncStatus = "saving" | "saved";

interface EditorStore {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
  syncStatus: SyncStatus;
  setSyncStatus: (syncStatus: SyncStatus) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      viewMode: "edit",

      setViewMode: (viewMode: ViewMode) => {
        set({ viewMode });
      },

      syncStatus: "saved",
      setSyncStatus: (syncStatus: SyncStatus) => {
        set({ syncStatus });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        viewMode: state.viewMode,
      }),
    }
  )
);
