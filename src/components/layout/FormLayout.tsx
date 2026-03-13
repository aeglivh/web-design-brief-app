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
    <div className="min-h-screen py-12 px-5" style={style}>
      <div
        className="mx-auto rounded-[24px]"
        style={{
          maxWidth,
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
