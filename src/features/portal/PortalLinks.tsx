import type { PortalLink } from "./usePortalData";

interface PortalLinksProps {
  links: PortalLink[];
  accent: string;
}

export function PortalLinks({ links, accent }: PortalLinksProps) {
  if (!links || links.length === 0) return null;

  return (
    <div
      className="rounded-[16px]"
      style={{
        border: "1px solid var(--th-border-light)",
        background: "var(--th-surface)",
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      <p
        className="text-[10px] font-medium uppercase"
        style={{
          color: "var(--th-text-muted)",
          letterSpacing: "0.15em",
          marginBottom: 14,
        }}
      >
        Project Links
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-[13px] font-medium no-underline hover:opacity-80 transition-opacity"
            style={{ color: accent, gap: 8 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
