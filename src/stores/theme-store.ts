import { create } from "zustand";
import { persist } from "zustand/middleware";
import { themes } from "~/constants/themes";
import { type ColorScheme, type ThemeName } from "~/types/theme";

const STORAGE_KEY = "moodeng-theme";

function applyTheme(themeName: ThemeName, colorScheme: ColorScheme) {
  const theme = themes[themeName];

  // Determine if we should use dark mode
  let isDark = false;
  if (colorScheme === "dark" || theme.colorScheme === "dark") {
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

  // Apply theme-specific CSS variables
  const root = document.documentElement;
  root.style.setProperty("--theme-hue", theme.primaryHue.toString());
  root.style.setProperty("--theme-saturation", theme.saturation.toString());
  root.setAttribute("data-theme", themeName);
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
      currentTheme: "default",
      colorScheme: "auto",

      setTheme: (theme: ThemeName) => {
        const themeConfig = themes[theme];
        set({
          currentTheme: theme,
          colorScheme: themeConfig.colorScheme,
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
