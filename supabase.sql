-- Run this once in the Supabase SQL editor (free tier project) to enable database storage.
-- All app data (milk entries, milk types, products, expenses, etc.) and all societies/members
-- live only in these two tables — nothing is cached in browser localStorage.

create table if not exists milk_manager_data (
    id text primary key, -- society id
    payload jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists milk_manager_societies (
    id text primary key, -- society id
    payload jsonb not null -- { societyName, blockNumber, members: [{ name, password }] }
);

alter table milk_manager_data enable row level security;

alter table milk_manager_societies enable row level security;

-- Free/demo setup: allow the anon key to read & write these rows.
-- Tighten these policies (e.g. require auth.uid()) before using with real users.
create policy "allow anon read/write" on milk_manager_data for all using (true)
with
    check (true);

create policy "allow anon read/write" on milk_manager_societies for all using (true)
with
    check (true);

-- Audit trail: records who (which logged-in member) created/updated/deleted what, and when.
create table if not exists milk_manager_audit_log (
    id uuid primary key default gen_random_uuid(),
    society_id text not null,
    user_name text not null,
    action text not null, -- create | update | delete
    entity text not null, -- milkEntry | milkType | expense | member
    entity_id text not null,
    summary text,
    before jsonb,
    after jsonb,
    created_at timestamptz not null default now()
);

create index if not exists milk_manager_audit_log_society_idx on milk_manager_audit_log (society_id, created_at desc);

alter table milk_manager_audit_log enable row level security;

create policy "allow anon read/write" on milk_manager_audit_log for all using (true)
with
    check (true);