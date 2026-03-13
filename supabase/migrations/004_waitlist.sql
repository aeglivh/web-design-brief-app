-- Waitlist table for pre-launch signups
create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  referral   text,
  created_at timestamptz default now()
);

-- Allow anonymous inserts (public signup), no read/update/delete
alter table waitlist enable row level security;

create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);
