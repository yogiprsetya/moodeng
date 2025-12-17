import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColorScheme, ThemeName } from "~/types/theme";

const STORAGE_KEY = "moodeng-theme";

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

interface ThemeStore {
  currentTheme: ThemeName;
  colorScheme: ColorScheme;
  setTheme: (theme: ThemeName) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: "nord",
      colorScheme: "auto",

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
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
