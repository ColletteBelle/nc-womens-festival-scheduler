create extension if not exists "pgcrypto";

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null check (type in ('preselected', 'open')),
  duration_minutes integer,
  status text not null default 'open' check (status in ('open', 'confirmed')),
  confirmed_slot_id uuid,
  created_at timestamptz not null default now(),
  constraint duration_required_for_open check (type <> 'open' or duration_minutes is not null)
);

create table slots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  source text not null check (source in ('preselected', 'user_added')),
  added_by_name text,
  created_at timestamptz not null default now()
);

alter table events
  add constraint events_confirmed_slot_id_fkey
  foreign key (confirmed_slot_id) references slots(id) on delete set null;

create table votes (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  voter_name text not null,
  response text not null check (response in ('yes', 'no')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slot_id, voter_name)
);

create index slots_event_id_idx on slots(event_id);
create index votes_slot_id_idx on votes(slot_id);

-- This is a ~10-person internal tool with no login system (see product brief);
-- RLS is enabled but policies are permissive so the anon key can read/write
-- directly from the client without a backend auth layer.
alter table events enable row level security;
alter table slots enable row level security;
alter table votes enable row level security;

create policy "public read events" on events for select using (true);
create policy "public insert events" on events for insert with check (true);
create policy "public update events" on events for update using (true);

create policy "public read slots" on slots for select using (true);
create policy "public insert slots" on slots for insert with check (true);
create policy "public delete slots" on slots for delete using (true);

create policy "public read votes" on votes for select using (true);
create policy "public insert votes" on votes for insert with check (true);
create policy "public update votes" on votes for update using (true);
