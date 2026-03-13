import { useState, useEffect, useCallback } from "react";
import { authFetch, API_BASE } from "@/lib/api";
import type { Rates } from "@/lib/types";

const DEFAULT_RATES: Omit<Rates, "id" | "designer_id"> = {
  page_rates: { landing: 1500, inner: 800, blog: 600, ecommerce: 2000 },
  addon_rates: {
    contactForm: 200,
    gallery: 400,
    newsletter: 300,
    seo: 500,
    booking: 600,
    ecommerce: 1500,
    livechat: 200,
    multilanguage: 800,
    blog: 400,
    copywriting: 150,
    photography: 400,
    maintenance: 200,
    training: 300,
  },
  hourly_rate: 120,
  multipliers: { simple: 1.0, moderate: 1.2, complex: 1.5 },
  currency: "CHF",
  vat_rate: 0,
};

export function useRates(session: unknown) {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE}/api/rates`);
        const data = await res.json();
        if (data?.designer_id) {
          setRates({
            page_rates: data.page_rates || DEFAULT_RATES.page_rates,
            addon_rates: data.addon_rates || DEFAULT_RATES.addon_rates,
            hourly_rate: data.hourly_rate ?? DEFAULT_RATES.hourly_rate,
            multipliers: data.multipliers || DEFAULT_RATES.multipliers,
            currency: data.currency || DEFAULT_RATES.currency,
            vat_rate: data.vat_rate ?? DEFAULT_RATES.vat_rate,
          });
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, [session]);

  const saveRates = useCallback(
    async (
      updates: Omit<Rates, "id" | "designer_id">
    ): Promise<void> => {
      const res = await authFetch(`${API_BASE}/api/rates`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setRates(updates);
    },
    []
  );

  return { rates, loading, saveRates };
}
