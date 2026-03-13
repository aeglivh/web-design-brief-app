import { useState, useEffect, useCallback } from "react";
import { authFetch, API_BASE } from "@/lib/api";
import type { Designer } from "@/lib/types";

export function useDesigner(session: unknown) {
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE}/api/designer`);
        const data = await res.json();
        if (data?.id) {
          setDesigner(data);
        } else {
          setNeedsOnboarding(true);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, [session]);

  const updateDesigner = useCallback(
    async (updates: Partial<Designer>): Promise<Designer | null> => {
      const res = await authFetch(`${API_BASE}/api/designer`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setDesigner(data);
      return data;
    },
    []
  );

  const createDesigner = useCallback(
    async (studio_name: string, slug: string): Promise<Designer> => {
      const res = await authFetch(`${API_BASE}/api/designer`, {
        method: "POST",
        body: JSON.stringify({ studio_name, slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setDesigner(data);
      setNeedsOnboarding(false);
      return data;
    },
    []
  );

  return {
    designer,
    loading,
    needsOnboarding,
    updateDesigner,
    createDesigner,
  };
}
