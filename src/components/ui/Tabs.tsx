import { cn } from "@/lib/cn";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  accent?: string;
  className?: string;
}

export function Tabs({ tabs, active, onChange, accent, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 rounded-xl bg-th-surface", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 py-2.5 px-3 text-[12px] tracking-wide font-medium cursor-pointer rounded-lg transition-all",
              isActive
                ? "bg-th-surface-hover border border-th-border text-th-text shadow-sm"
                : "text-th-muted border border-transparent hover:text-th-secondary hover:bg-th-surface"
            )}
            style={
              isActive && accent
                ? { color: accent, borderColor: accent + "33" }
                : undefined
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
