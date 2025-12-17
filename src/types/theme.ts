export type ThemeName =
  | "miro"
  | "lofi"
  | "nord"
  | "tokyo-night"
  | "valentine"
  | "winter";

export type ColorScheme = "light" | "dark" | "auto";

export interface Theme {
  name: ThemeName;
  displayName: string;
}
