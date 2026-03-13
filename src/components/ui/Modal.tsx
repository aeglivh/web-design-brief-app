import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: ReactNode;
  className?: string;
  printable?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw]",
};

export function Modal({
  open,
  onClose,
  title,
  size = "lg",
  children,
  className,
  printable,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5",
        printable && "print-flatten"
      )}
      style={{ animation: "fade-in 0.15s ease-out" }}
    >
      <div
        className={cn(
          "w-full rounded-[24px] overflow-y-auto max-h-[90vh]",
          "bg-[linear-gradient(135deg,var(--th-surface-gradient-from,rgba(255,255,255,0.06))_0%,var(--th-surface-gradient-to,rgba(255,255,255,0.01))_100%)]",
          "backdrop-blur-[28px] border border-th-border",
          "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_0_var(--th-border-light-color,rgba(255,255,255,0.05))]",
          sizeClasses[size],
          printable && "print-flatten",
          className
        )}
        style={{ animation: "enter 0.2s ease-out" }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-th-border-light">
            <h2 className="text-[15px] font-medium text-th-text">{title}</h2>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-th-muted hover:text-th-secondary hover:bg-th-surface-hover transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
