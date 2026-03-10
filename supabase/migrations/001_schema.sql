-- ─── Designers ───────────────────────────────────────────────────────────────
create table designers (
  id                   uuid primary key references auth.users(id),
  studio_name          text not null,
  slug                 text unique not null check (slug ~ '^[a-z0-9-]{2,60}$'),
  tagline              text default '',
  accent_color         text default '#3b82f6',
  logo_url             text default '',
  designer_email       text default '',
  bg_color             text default '#f1f5f9',
  form_bg_colour       text default '#ffffff',
  dashboard_bg_colour  text default '#f1f5f9',
  dashboard_bar_colour text default '#0f172a',
  heading_font         text default 'Inter',
  body_font            text default 'Inter',
  created_at           timestamptz default now()
);

-- ─── Rates ───────────────────────────────────────────────────────────────────
create table rates (
  id           uuid primary key default gen_random_uuid(),
  designer_id  uuid unique not null references designers(id) on delete cascade,
  page_rates   jsonb default '{"landing":1500,"inner":800,"blog":600,"ecommerce":2000}'::jsonb,
  addon_rates  jsonb default '{"contactForm":200,"gallery":400,"newsletter":300,"seo":500,"booking":600,"ecommerce":1500,"livechat":200,"multilanguage":800,"blog":400,"copywriting":150,"photography":400,"maintenance":200,"training":300}'::jsonb,
  hourly_rate  numeric default 120,
  multipliers  jsonb default '{"simple":1.0,"moderate":1.2,"complex":1.5}'::jsonb,
  currency     text default 'CHF',
  updated_at   timestamptz default now()
);

-- ─── Briefs ──────────────────────────────────────────────────────────────────
create table briefs (
  id            uuid primary key default gen_random_uuid(),
  designer_id   uuid not null references designers(id) on delete cascade,
  client_name   text default '',
  client_email  text default '',
  business_name text default '',
  industry      text default '',
  project_type  text default '',
  page_count    text default '',
  budget        text default '',
  brief_text    text default '',
  tags          jsonb,
  quote         jsonb,
  form_snapshot jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table designers enable row level security;
alter table rates enable row level security;
alter table briefs enable row level security;

-- Designers: own row + public read (for client form branding)
create policy "designers_own" on designers for all using (auth.uid() = id);
create policy "designers_public_read" on designers for select using (true);

-- Rates: own rates only
create policy "rates_own" on rates for all using (designer_id = auth.uid());

-- Briefs: own briefs only (service role inserts from API)
create policy "briefs_own" on briefs for all using (designer_id = auth.uid());

-- ─── Storage ─────────────────────────────────────────────────────────────────
-- Create via Supabase dashboard:
--   Bucket name: brief-uploads
--   Public: true (for serving uploaded assets)
--   File size limit: 5MB
