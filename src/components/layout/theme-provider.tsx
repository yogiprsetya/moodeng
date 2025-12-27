import { useEffect, type ReactNode } from "react";
import { useWorkspaceStore } from "~/stores/data-workspace";
import { loadThemeCSS } from "~/utils/theme-loader";
import { handleError } from "~/utils/error-handle";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentTheme, colorScheme, applyTheme } = useWorkspaceStore();

  useEffect(() => {
    // Load theme CSS dynamically and apply theme
    const initializeTheme = async () => {
      await loadThemeCSS(currentTheme);
      applyTheme();
    };

    initializeTheme().catch(handleError);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (colorScheme === "auto") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [currentTheme, colorScheme, applyTheme]);

  return <>{children}</>;
}
