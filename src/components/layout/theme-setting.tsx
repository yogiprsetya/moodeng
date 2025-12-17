import { Palette, Moon, Sun, Monitor, type LucideIcon } from "lucide-react";
import { useThemeStore } from "~/stores/theme-store";
import { type ThemeName, type ColorScheme } from "~/types/theme";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/utils/css";
import { useState } from "react";
import { themes } from "~/constants/themes";

const colorSchemeOptions: {
  value: ColorScheme;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "auto", label: "Auto", icon: Monitor },
];

export function ThemeSetting() {
  const { currentTheme, colorScheme, setTheme, setColorScheme } =
    useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="size-4" />
          <span className="sr-only">Theme Settings</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[320px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Theme Settings</SheetTitle>

          <SheetDescription>
            Choose a theme and color scheme that suits your preference
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8 px-4">
          {/* Color Scheme Selection */}
          <div>
            <h3 className="font-medium mb-3">Color Scheme</h3>

            <div className="flex gap-2">
              {colorSchemeOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    onClick={() => setColorScheme(option.value)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all shadow-sm",
                      "hover:bg-accent hover:border-accent-foreground/20 hover:shadow-md active:scale-[0.98]",
                      colorScheme === option.value
                        ? "bg-accent border-accent-foreground/30 ring-2 ring-ring/50"
                        : "border-border bg-background"
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <h3 className="font-medium mb-3">Theme</h3>

            <div className="grid grid-cols-2 gap-2">
              {(Object.values(themes) as (typeof themes)[ThemeName][]).map(
                (theme) => {
                  const isSelected = currentTheme === theme.name;

                  return (
                    <button
                      key={theme.name}
                      onClick={() => {
                        setTheme(theme.name);
                      }}
                      className={cn(
                        "flex flex-col items-start gap-2 p-3 rounded-lg border transition-all text-left shadow-sm",
                        "hover:bg-accent hover:border-accent-foreground/20 hover:shadow-md active:scale-[0.98]",
                        isSelected
                          ? "bg-accent border-accent-foreground/30 ring-2 ring-ring/50"
                          : "border-border bg-background"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{theme.displayName}</span>
                      </div>

                      <div className="w-full h-8 rounded-md border bg-muted" />
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
