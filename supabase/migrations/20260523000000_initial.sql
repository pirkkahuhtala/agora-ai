-- Rooms
create table rooms (
  id         uuid primary key default gen_random_uuid(),
  topic      text not null,
  created_at timestamptz not null default now(),
  summary    text
);

-- Messages
create table messages (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references rooms(id) on delete cascade,
  author     text not null,
  content    text not null,
  created_at timestamptz not null default now(),
  is_ai      boolean not null default false
);

-- Participants
create table participants (
  id        uuid primary key default gen_random_uuid(),
  room_id   uuid not null references rooms(id) on delete cascade,
  name      text not null,
  joined_at timestamptz not null default now()
);

-- Indexes
create index messages_room_id_idx    on messages(room_id);
create index participants_room_id_idx on participants(room_id);

-- RLS
alter table rooms        enable row level security;
alter table messages     enable row level security;
alter table participants enable row level security;

-- Permissive anon policies (MVP — no auth)
create policy "anon read rooms"         on rooms        for select using (true);
create policy "anon insert rooms"       on rooms        for insert with check (true);
create policy "anon update rooms"       on rooms        for update using (true);

create policy "anon read messages"      on messages     for select using (true);
create policy "anon insert messages"    on messages     for insert with check (true);

create policy "anon read participants"  on participants for select using (true);
create policy "anon insert participants" on participants for insert with check (true);
create policy "anon delete participants" on participants for delete using (true);

-- Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table participants;
