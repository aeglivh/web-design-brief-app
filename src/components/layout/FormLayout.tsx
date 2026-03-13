import type { ReactNode, CSSProperties } from "react";

interface FormLayoutProps {
  bgColor?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function FormLayout({
  bgColor,
  children,
  maxWidth = "640px",
}: FormLayoutProps) {
  const style: CSSProperties = bgColor ? { backgroundColor: bgColor } : { backgroundColor: "var(--th-bg)" };

  return (
    <div className="h-screen flex items-center justify-center px-5 py-6 overflow-hidden" style={style}>
      <div
        className="w-full rounded-[24px] flex flex-col"
        style={{
          maxWidth,
          maxHeight: "calc(100vh - 48px)",
          background: "linear-gradient(135deg, var(--th-surface-hover) 0%, var(--th-surface) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid var(--th-border)",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5), inset 0 1px 1px 0 var(--th-border-light)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
