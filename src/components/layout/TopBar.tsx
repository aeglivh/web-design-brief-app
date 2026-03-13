import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { isLight } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/features/auth/lib/supabase";

interface TopBarProps {
  studioName: string;
  slug?: string;
  accent: string;
  barColor: string;
}

export function TopBar({ studioName, slug, accent, barColor }: TopBarProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();

  const light = barColor ? isLight(barColor) : false;

  // Inline color styles that adapt to the bar background
  const textStyle = { color: light ? "rgba(0,0,0,0.88)" : "var(--th-text)" };
  const mutedStyle = { color: light ? "rgba(0,0,0,0.5)" : "var(--th-text-secondary)" };
  const slugStyle = { color: light ? "rgba(0,0,0,0.35)" : "var(--th-text-muted)" };
  const dividerStyle = { backgroundColor: light ? "rgba(0,0,0,0.1)" : "var(--th-surface-hover)" };
  const hoverBg = light ? "hover:bg-black/[0.04]" : "hover:bg-th-surface-hover";

  const copyLink = () => {
    const url = `${window.location.origin}/studio/${slug}`;
    navigator.clipboard.writeText(url).catch(() => {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header
      className="flex items-center justify-between px-5 h-12"
      style={{
        background: light
          ? barColor
          : "linear-gradient(135deg, var(--th-surface-hover) 0%, var(--th-surface) 100%)",
        backdropFilter: light ? undefined : "blur(28px)",
        WebkitBackdropFilter: light ? undefined : "blur(28px)",
        borderBottom: light
          ? "1px solid rgba(0,0,0,0.06)"
          : "1px solid var(--th-border)",
        boxShadow: light
          ? undefined
          : "0 24px 48px -12px rgba(0,0,0,0.5), inset 0 1px 1px 0 var(--th-border-light)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold"
          style={{ backgroundColor: accent }}
        >
          {studioName.charAt(0) || "B"}
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium leading-tight tracking-[-0.01em]" style={textStyle}>
            {studioName || "Dashboard"}
          </span>
          {slug && (
            <span className="text-[11px] font-mono leading-tight" style={slugStyle}>/{slug}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {slug && (
          <>
            <button
              onClick={copyLink}
              className={cn(
                "inline-flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-md transition-colors cursor-pointer",
                hoverBg
              )}
              style={copied ? { color: "#34d399" } : mutedStyle}
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              )}
              {copied ? "Copied" : "Share"}
            </button>
            <a
              href={`/studio/${slug}`}
              target="_blank"
              rel="noreferrer"
              className={cn("inline-flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-md transition-colors no-underline", hoverBg)}
              style={mutedStyle}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              Preview
            </a>
          </>
        )}
        <div className="w-px h-3.5 mx-1.5" style={dividerStyle} />
        <button
          onClick={toggleTheme}
          className={cn("inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer", hoverBg)}
          style={mutedStyle}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {isDark ? (
              <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>
            ) : (
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            )}
          </svg>
        </button>
        <div className="w-px h-3.5 mx-1.5" style={dividerStyle} />
        <button
          onClick={signOut}
          className={cn("inline-flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-md transition-colors cursor-pointer", hoverBg)}
          style={mutedStyle}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Sign out
        </button>
      </div>
    </header>
  );
}
