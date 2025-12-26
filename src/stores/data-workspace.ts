import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "~/api/browser/db";
import type { Workspace } from "~/types/workspace";
import type { ColorScheme, ThemeName } from "~/types/theme";

const STORAGE_KEY = "moodeng-workspace";

function applyTheme(themeName: ThemeName, colorScheme: ColorScheme) {
  // Determine if we should use dark mode
  let isDark = false;
  if (colorScheme === "dark") {
    isDark = true;
  } else if (colorScheme === "auto") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Apply dark class
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Apply theme data attribute
  document.documentElement.setAttribute("data-theme", themeName);
}

interface WorkspaceStore {
  // Workspace state
  workspace: Workspace | null;
  isLoadingWorkspace: boolean;
  workspaceError: Error | null;

  // Theme state
  currentTheme: ThemeName;
  colorScheme: ColorScheme;

  // Workspace actions
  loadWorkspace: () => Promise<void>;
  updateWorkspace: (updates: Partial<Workspace>) => Promise<void>;
  updateLastNoteId: (noteId: string | null) => Promise<void>;

  // Theme actions
  setTheme: (theme: ThemeName) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  applyTheme: () => void;

  // Utility actions
  clearErrors: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // Initial workspace state
      workspace: null,
      isLoadingWorkspace: false,
      workspaceError: null,

      // Initial theme state
      currentTheme: "nord",
      colorScheme: "auto",

      // Workspace actions
      loadWorkspace: async () => {
        set({ isLoadingWorkspace: true, workspaceError: null });
        try {
          const workspace = await db.getWorkspace();
          set({ workspace, isLoadingWorkspace: false });
        } catch (err) {
          const error =
            err instanceof Error ? err : new Error("Failed to load workspace");
          set({ workspaceError: error, isLoadingWorkspace: false });
        }
      },

      updateWorkspace: async (updates: Partial<Workspace>) => {
        const { workspace } = get();
        const currentWorkspace = workspace || (await db.getWorkspace());

        if (!currentWorkspace) {
          throw new Error("Workspace not found");
        }

        const updatedWorkspace: Workspace = {
          ...currentWorkspace,
          ...updates,
        };

        await db.saveWorkspace(updatedWorkspace);
        set({ workspace: updatedWorkspace });
      },

      updateLastNoteId: async (noteId: string | null) => {
        await get().updateWorkspace({ lastNoteId: noteId });
      },

      // Theme actions
      setTheme: (theme: ThemeName) => {
        set({
          currentTheme: theme,
        });
        get().applyTheme();
      },

      setColorScheme: (scheme: ColorScheme) => {
        set({ colorScheme: scheme });
        get().applyTheme();
      },

      applyTheme: () => {
        const { currentTheme, colorScheme } = get();
        applyTheme(currentTheme, colorScheme);
      },

      // Utility actions
      clearErrors: () => {
        set({
          workspaceError: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      // Persist both workspace and theme settings
      partialize: (state) => ({
        workspace: state.workspace,
        currentTheme: state.currentTheme,
        colorScheme: state.colorScheme,
      }),
    }
  )
);

