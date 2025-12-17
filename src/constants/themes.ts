import type { Theme, ThemeName } from "~/types/theme";

export const themes: Record<ThemeName, Theme> = {
  miro: {
    name: "miro",
    displayName: "Miro",
  },
  lofi: {
    name: "lofi",
    displayName: "Lo-Fi",
  },
  nord: {
    name: "nord",
    displayName: "Nord",
  },
  "tokyo-night": {
    name: "tokyo-night",
    displayName: "Tokyo Night",
  },
  valentine: {
    name: "valentine",
    displayName: "Valentine",
  },
  winter: {
    name: "winter",
    displayName: "Winter",
  },
};
