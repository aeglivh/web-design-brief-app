import { useState, useEffect, useCallback } from "react";
import { authFetch, API_BASE } from "@/lib/api";

interface ProjectLink {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

interface ProjectLinksPanelProps {
  briefId: string;
  accent: string;
}

export function ProjectLinksPanel({ briefId, accent }: ProjectLinksPanelProps) {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchLinks = useCallback(async () => {
    try {
      const res = await authFetch(
        `${API_BASE}/api/project-links?brief_id=${briefId}`
      );
      const data = await res.json();
      setLinks(data.links || []);
    } catch {
      // silent
    }
    setLoading(false);
  }, [briefId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAdd = async () => {
    if (!label.trim() || !url.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/project-links`, {
        method: "POST",
        body: JSON.stringify({ brief_id: briefId, label: label.trim(), url: url.trim() }),
      });
      const data = await res.json();
      if (data.success && data.link) {
        setLinks((prev) => [...prev, data.link]);
        setLabel("");
        setUrl("");
      } else {
        setError(data.error || "Failed to add link");
      }
    } catch {
      setError("Network error");
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const prev = links;
    setLinks((l) => l.filter((x) => x.id !== id));
    try {
      const res = await authFetch(
        `${API_BASE}/api/project-links?id=${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.success) setLinks(prev);
    } catch {
      setLinks(prev);
    }
  };

  return (
    <div
      className="rounded-[16px]"
      style={{
        border: "1px solid var(--th-border-light)",
        background: "var(--th-surface)",
        padding: 24,
        marginTop: 20,
      }}
    >
      <p
        className="text-[10px] font-medium uppercase"
        style={{
          color: "var(--th-text-muted)",
          letterSpacing: "0.15em",
          marginBottom: 16,
        }}
      >
        Project Links
      </p>

      {/* Existing links */}
      {loading ? (
        <p className="text-[12px]" style={{ color: "var(--th-text-muted)" }}>
          Loading...
        </p>
      ) : links.length > 0 ? (
        <div style={{ marginBottom: 16 }}>
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between"
              style={{
                padding: "8px 0",
                borderBottom: "1px solid var(--th-border-light)",
              }}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-[13px] font-medium no-underline hover:opacity-80 transition-opacity"
                style={{ color: accent, gap: 6 }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                {link.label}
              </a>
              <button
                type="button"
                onClick={() => handleDelete(link.id)}
                className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer bg-transparent border-0 transition-colors hover:bg-[var(--th-surface-hover)]"
                style={{ color: "var(--th-text-muted)" }}
                title="Remove link"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="text-[12px]"
          style={{ color: "var(--th-text-muted)", marginBottom: 16 }}
        >
          No links yet. Add links to staging sites, Figma files, or shared folders.
        </p>
      )}

      {/* Add link form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Link label (e.g. Figma file)"
          className="w-full rounded-lg border text-[13px] outline-none"
          style={{
            padding: "8px 12px",
            borderColor: "var(--th-border)",
            backgroundColor: "var(--th-input-bg)",
            color: "var(--th-text)",
          }}
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border text-[13px] outline-none"
          style={{
            padding: "8px 12px",
            borderColor: "var(--th-border)",
            backgroundColor: "var(--th-input-bg)",
            color: "var(--th-text)",
          }}
        />
        {error && (
          <p className="text-[11px]" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!label.trim() || !url.trim() || adding}
          className="h-8 rounded-lg text-[12px] font-medium cursor-pointer transition-all border-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: accent,
            color: "#fff",
            alignSelf: "flex-start",
            padding: "0 16px",
          }}
        >
          {adding ? "Adding..." : "Add Link"}
        </button>
      </div>
    </div>
  );
}
