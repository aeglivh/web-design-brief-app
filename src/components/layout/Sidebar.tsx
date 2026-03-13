import type { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside
      className="w-[260px] flex-shrink-0 overflow-y-auto"
      style={{
        background: "var(--th-glass-bg)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRight: "1px solid var(--th-border)",
      }}
    >
      {children}
    </aside>
  );
}
