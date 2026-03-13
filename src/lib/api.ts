import { supabase } from "@/features/auth/lib/supabase";

export const API_BASE =
  (typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__BRIEF_API__) ||
  "";

export async function authFetch(
  url: string,
  opts: RequestInit = {}
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token || "";

  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
}
