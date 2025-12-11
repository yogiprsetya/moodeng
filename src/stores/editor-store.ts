import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViewMode } from "~/types/editor";

const STORAGE_KEY = "moodeng-editor";

interface EditorStore {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      viewMode: "edit",

      setViewMode: (viewMode: ViewMode) => {
        set({ viewMode });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
