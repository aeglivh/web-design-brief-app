-- ─── Contracts ──────────────────────────────────────────────────────────────
create table contracts (
  id            uuid primary key default gen_random_uuid(),
  brief_id      uuid not null references briefs(id) on delete cascade,
  designer_id   uuid not null references designers(id) on delete cascade,
  contract_data jsonb default '{}'::jsonb,
  status        text default 'draft' check (status in ('draft', 'sent', 'signed')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Add status column to briefs
alter table briefs add column if not exists status text default 'new';

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table contracts enable row level security;

-- Contracts: designers can only access their own contracts
create policy "contracts_own" on contracts for all using (designer_id = auth.uid());
