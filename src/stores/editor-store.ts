import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViewMode } from "~/types/editor";

const STORAGE_KEY = "moodeng-editor";

interface EditorStore {
  title: string;
  content: string;
  viewMode: ViewMode;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      title: "",
      content: "",
      viewMode: "edit",

      setTitle: (title: string) => {
        set({ title: title.trim() || "" });
      },

      setContent: (content: string) => {
        set({ content });
      },

      setViewMode: (viewMode: ViewMode) => {
        set({ viewMode });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
