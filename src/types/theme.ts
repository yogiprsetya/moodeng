export type ThemeName =
  | "default"
  | "warm"
  | "cool"
  | "sepia"
  | "dark"
  | "dark-warm";

export type ColorScheme = "light" | "dark" | "auto";

export interface Theme {
  name: ThemeName;
  displayName: string;
  colorScheme: ColorScheme;
  primaryHue: number;
  saturation: number;
}
