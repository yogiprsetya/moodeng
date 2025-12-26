import { useEffect, type ReactNode } from "react";
import { useWorkspaceStore } from "~/stores/data-workspace";

// Provider component to initialize theme and listen to system changes
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentTheme, colorScheme, applyTheme } = useWorkspaceStore();

  useEffect(() => {
    // Apply theme on mount
    applyTheme();

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
