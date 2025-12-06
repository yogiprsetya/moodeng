import type { Theme, ThemeName } from "~/types/theme";

export const themes: Record<ThemeName, Theme> = {
  default: {
    name: "default",
    displayName: "Default",
    colorScheme: "light",
    primaryHue: 250,
    saturation: 0.02,
  },
  warm: {
    name: "warm",
    displayName: "Warm",
    colorScheme: "light",
    primaryHue: 40,
    saturation: 0.03,
  },
  cool: {
    name: "cool",
    displayName: "Cool",
    colorScheme: "light",
    primaryHue: 220,
    saturation: 0.02,
  },
  sepia: {
    name: "sepia",
    displayName: "Sepia",
    colorScheme: "light",
    primaryHue: 50,
    saturation: 0.04,
  },
  dark: {
    name: "dark",
    displayName: "Dark",
    colorScheme: "dark",
    primaryHue: 250,
    saturation: 0.01,
  },
  "dark-warm": {
    name: "dark-warm",
    displayName: "Dark Warm",
    colorScheme: "dark",
    primaryHue: 40,
    saturation: 0.012,
  },
};
