import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Hook that returns the current auth session.
 * Returns `undefined` while loading, `null` if not authenticated, or the Session.
 */
export function useAuth(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) { settled = true; setSession(null); }
    }, 3000);
    supabase.auth.getSession()
      .then(({ data }) => { if (!settled) { settled = true; setSession(data.session); } })
      .catch(() => { if (!settled) { settled = true; setSession(null); } })
      .finally(() => clearTimeout(timeout));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  }, []);

  return session;
}
