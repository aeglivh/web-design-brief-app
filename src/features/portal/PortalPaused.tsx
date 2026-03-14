interface PortalPausedProps {
  designerName: string;
  designerLogo: string | null;
}

export function PortalPaused({ designerName, designerLogo }: PortalPausedProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--th-bg)" }}
    >
      <div
        className="rounded-[16px] text-center"
        style={{
          maxWidth: 400,
          border: "1px solid var(--th-border-light)",
          background: "var(--th-surface)",
          padding: "40px 32px",
        }}
      >
        {designerLogo ? (
          <img
            src={designerLogo}
            alt={designerName}
            className="mx-auto object-contain"
            style={{ width: 56, height: 56, marginBottom: 24, borderRadius: 12 }}
          />
        ) : (
          <div
            className="mx-auto flex items-center justify-center text-white text-[18px] font-bold"
            style={{
              width: 56,
              height: 56,
              marginBottom: 24,
              borderRadius: 12,
              backgroundColor: "#a1a1aa",
            }}
          >
            {(designerName || "S").charAt(0)}
          </div>
        )}
        <h1
          className="text-[20px] font-semibold"
          style={{ color: "var(--th-text)", marginBottom: 8 }}
        >
          {designerName}
        </h1>
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: "var(--th-text-muted)" }}
        >
          Your designer is preparing your project details. Check back soon.
        </p>
      </div>
    </div>
  );
}
