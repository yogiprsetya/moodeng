import type { ThemeName } from "~/types/theme";

/**
 * Dynamically loads theme CSS files using dynamic imports.
 * Vite will code-split these CSS files, so only the active theme is loaded.
 * CSS imports return a module, but we just need to import them to load the CSS.
 */
const THEME_LOADERS: Record<ThemeName, () => Promise<{ default?: unknown }>> = {
  miro: () => import("~/styles/theme-miro.css"),
  lofi: () => import("~/styles/theme-lofi.css"),
  nord: () => import("~/styles/theme-nord.css"),
  "tokyo-night": () => import("~/styles/theme-tokyo-night.css"),
  valentine: () => import("~/styles/theme-valentine.css"),
  winter: () => import("~/styles/theme-winter.css"),
};

const loadedThemes = new Set<ThemeName>();
let currentTheme: ThemeName | null = null;

/**
 * Loads a theme CSS file dynamically.
 * Each theme CSS is code-split by Vite, so it's only loaded when needed.
 */
export async function loadThemeCSS(themeName: ThemeName): Promise<void> {
  // Don't reload if it's already the current theme
  if (currentTheme === themeName && loadedThemes.has(themeName)) {
    return;
  }

  // Load the CSS file if not already loaded
  if (!loadedThemes.has(themeName)) {
    const loader = THEME_LOADERS[themeName];
    if (loader) {
      await loader();
      loadedThemes.add(themeName);
    }
  }

  currentTheme = themeName;
}
