import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import type { LucideIcon } from "lucide-react";

interface ToolbarButtonConfig {
  icon: LucideIcon;
  label: string;
}

interface ToolbarButtonsProps {
  buttons: ToolbarButtonConfig[];
  handlers: Record<string, () => void>;
  disabled?: boolean;
}

export function ToolbarButtons({
  buttons,
  handlers,
  disabled,
}: ToolbarButtonsProps) {
  return (
    <ButtonGroup
      aria-label={
        disabled ? "Cannot edit in read-only mode" : "Toolbar buttons"
      }
      title={disabled ? "Cannot edit in read-only mode" : undefined}
    >
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.label}
            variant="ghost"
            size="icon-sm"
            onClick={handlers[button.label]}
            title={button.label}
            className="h-8 w-8"
            disabled={disabled}
          >
            <Icon className="size-4" />
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
