import { Search } from "lucide-react";
import { SidebarInput } from "~/components/ui/sidebar";

interface SearchFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchField = ({ value, onChange }: SearchFieldProps) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

    <SidebarInput
      placeholder="Search notes..."
      value={value}
      onChange={onChange}
      className="pl-9"
    />
  </div>
);
