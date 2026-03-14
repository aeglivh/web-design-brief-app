import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

export interface PortalUpdate {
  id: string;
  brief_id: string;
  designer_id: string;
  status_label: string;
  note: string | null;
  link_url: string | null;
  link_label: string | null;
  feedback_requested: boolean;
  nudge_sent_at: string | null;
  created_at: string;
}

export interface PortalLink {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

export interface PortalContract {
  id: string;
  contract_data: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface PortalBrief {
  id: string;
  business_name: string;
  client_name: string;
  client_email: string;
  industry: string;
  project_type: string;
  portal_status: string;
  created_at: string;
  signed_at: string | null;
  signed_name: string | null;
  deposit_url: string | null;
  deposit_paid: boolean;
  completed_at: string | null;
  completion_message: string | null;
  brief_visible: boolean;
  quote_visible: boolean;
  contract_visible: boolean;
  brief_text: string | null;
  tags: Record<string, unknown> | null;
  quote: Record<string, unknown> | null;
}

export interface PortalDesigner {
  studio_name: string;
  slug: string;
  logo_url: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  form_bg_colour: string;
  tagline: string;
}

export interface PortalData {
  brief: PortalBrief;
  contract: PortalContract | null;
  updates: PortalUpdate[];
  links: PortalLink[];
  feedback_update_ids: string[];
  designer: PortalDesigner;
}

export interface PortalPausedData {
  paused: true;
  designer_name: string;
  designer_logo: string;
}

export function usePortalData(slug: string | undefined) {
  const [data, setData] = useState<PortalData | null>(null);
  const [pausedData, setPausedData] = useState<PortalPausedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/api/portal?slug=${slug}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((json) => {
        if (json.paused) {
          setPausedData(json);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  return { data, pausedData, loading, notFound };
}
