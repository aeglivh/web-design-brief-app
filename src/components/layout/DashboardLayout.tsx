import { useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/lib/theme";
import { isLight } from "@/lib/utils";

interface DashboardLayoutProps {
  studioName: string;
  slug?: string;
  accent: string;
  barColor: string;
  bgColor: string;
  sidebar: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

export function DashboardLayout({
  studioName,
  slug,
  accent,
  barColor,
  bgColor,
  sidebar,
  children,
  fullWidth,
}: DashboardLayoutProps) {
  const { isDark } = useTheme();

  // In dark mode: use custom bgColor. In light mode: use theme bg (light slate).
  const effectiveBg = isDark ? bgColor : "";
  const effectiveBar = isDark ? barColor : "";

  // Override theme tokens ONLY on the main content area so sidebar/modals follow the theme toggle
  const mainOverrides = useMemo((): CSSProperties => {
    if (!effectiveBg) return { backgroundColor: "var(--th-bg)" };

    const light = isLight(effectiveBg);
    const text = light ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.92)";
    const textSecondary = light ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";
    const textMuted = light ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.32)";
    const border = light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.09)";
    const borderLight = light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
    const surface = light ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.03)";
    const surfaceHover = light ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.06)";
    const inputBg = light ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.04)";
    const placeholder = light ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.25)";
    const icon = light ? "#2d2d3a" : "white";

    return {
      backgroundColor: effectiveBg,
      "--th-text": text,
      "--th-text-secondary": textSecondary,
      "--th-text-muted": textMuted,
      "--th-border": border,
      "--th-border-light": borderLight,
      "--th-surface": surface,
      "--th-surface-hover": surfaceHover,
      "--th-input-bg": inputBg,
      "--th-placeholder": placeholder,
      "--th-icon": icon,
      "--color-th-text": text,
      "--color-th-secondary": textSecondary,
      "--color-th-muted": textMuted,
      "--color-th-border": border,
      "--color-th-border-light": borderLight,
      "--color-th-surface": surface,
      "--color-th-surface-hover": surfaceHover,
      "--color-th-input": inputBg,
      "--color-th-placeholder": placeholder,
      "--color-th-icon": icon,
    } as CSSProperties;
  }, [effectiveBg]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--th-bg)" }}>
      <TopBar
        studioName={studioName}
        slug={slug}
        accent={accent}
        barColor={effectiveBar}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar>{sidebar}</Sidebar>
        <main className="flex-1 overflow-y-auto" style={mainOverrides}>
          <div className={fullWidth ? "px-10 py-8" : "max-w-[880px] mx-auto px-10 py-8"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
