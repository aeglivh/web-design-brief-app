import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch, API_BASE } from "@/lib/api";
import type { Brief, Quote } from "@/lib/types";

export function useBriefs(session: unknown) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!session) return;
    const isInitial = !hasFetched.current;
    (async () => {
      if (isInitial) setLoading(true);
      try {
        const res = await authFetch(`${API_BASE}/api/briefs`);
        const data = await res.json();
        if (Array.isArray(data)) setBriefs(data);
      } catch {
        // ignore
      }
      hasFetched.current = true;
      setLoading(false);
    })();
  }, [session]);

  const deleteBrief = useCallback(async (id: string) => {
    const res = await authFetch(
      `${API_BASE}/api/briefs?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (res.ok) setBriefs((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateBriefQuote = useCallback((briefId: string, quote: Quote) => {
    setBriefs((prev) =>
      prev.map((b) => (b.id === briefId ? { ...b, quote } : b))
    );
  }, []);

  return { briefs, loading, deleteBrief, updateBriefQuote };
}
