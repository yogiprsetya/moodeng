import type { ThemeName } from "./theme";

export interface Workspace {
  clientId: string;
  theme: ThemeName;
  darkmode: boolean;
  title: string;
  lastNoteId: string | null;
}
