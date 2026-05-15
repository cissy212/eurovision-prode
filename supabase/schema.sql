-- ============================================================
-- Eurovision Prode — Supabase Schema
-- Run this in the Supabase SQL editor to create all tables.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────
-- PROFILES  (mirrors auth.users)
-- ──────────────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text not null default '',
  avatar_url    text,
  created_at    timestamptz default now()
);

-- Auto-create a profile row whenever a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ──────────────────────────────────────────────────────────
-- CONTESTANTS
-- ──────────────────────────────────────────────────────────
create table if not exists contestants (
  id            uuid primary key default gen_random_uuid(),
  country       text not null,
  artist        text not null,
  song          text not null,
  flag_emoji    text not null,
  photo_url     text,
  running_order int,
  created_at    timestamptz default now()
);

-- ──────────────────────────────────────────────────────────
-- ROOMS
-- ──────────────────────────────────────────────────────────
create table if not exists rooms (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  invite_code   text not null unique,
  admin_user_id uuid not null references profiles(id) on delete cascade,
  locked        boolean not null default false,
  created_at    timestamptz default now()
);

-- ──────────────────────────────────────────────────────────
-- ROOM MEMBERS
-- ──────────────────────────────────────────────────────────
create table if not exists room_members (
  id        uuid primary key default gen_random_uuid(),
  room_id   uuid not null references rooms(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- ──────────────────────────────────────────────────────────
-- PREDICTIONS  (user's ranked top-10)
-- ──────────────────────────────────────────────────────────
create table if not exists predictions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  room_id        uuid not null references rooms(id) on delete cascade,
  rank           int not null check (rank between 1 and 10),
  contestant_id  uuid not null references contestants(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(user_id, room_id, rank),
  unique(user_id, room_id, contestant_id)
);

-- ──────────────────────────────────────────────────────────
-- FAVOURITES  (personal picks, no rank limit)
-- ──────────────────────────────────────────────────────────
create table if not exists favourites (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  room_id        uuid not null references rooms(id) on delete cascade,
  contestant_id  uuid not null references contestants(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(user_id, room_id, contestant_id)
);

-- ──────────────────────────────────────────────────────────
-- RESULTS  (official results, entered by admin)
-- ──────────────────────────────────────────────────────────
create table if not exists results (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references rooms(id) on delete cascade,
  rank           int not null check (rank between 1 and 10),
  contestant_id  uuid not null references contestants(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(room_id, rank),
  unique(room_id, contestant_id)
);

-- ──────────────────────────────────────────────────────────
-- SCORES  (computed after results published)
-- ──────────────────────────────────────────────────────────
create table if not exists scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  room_id       uuid not null references rooms(id) on delete cascade,
  total_score   int not null default 0,
  exact_matches int not null default 0,
  in_top10      int not null default 0,
  computed_at   timestamptz default now(),
  unique(user_id, room_id)
);

-- ──────────────────────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- ──────────────────────────────────────────────────────────

alter table profiles      enable row level security;
alter table rooms         enable row level security;
alter table room_members  enable row level security;
alter table contestants   enable row level security;
alter table predictions   enable row level security;
alter table favourites    enable row level security;
alter table results       enable row level security;
alter table scores        enable row level security;

-- Profiles: users can read all, update their own
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Contestants: public read
create policy "contestants_select" on contestants for select using (true);

-- Rooms: members can read; anyone authenticated can insert (create a room)
create policy "rooms_select" on rooms for select
  using (
    auth.uid() = admin_user_id
    or exists (
      select 1 from room_members rm where rm.room_id = id and rm.user_id = auth.uid()
    )
  );
create policy "rooms_insert" on rooms for insert with check (auth.uid() = admin_user_id);
create policy "rooms_update" on rooms for update using (auth.uid() = admin_user_id);

-- Room members: members can read; authenticated users can insert themselves
create policy "room_members_select" on room_members for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from room_members rm2 where rm2.room_id = room_id and rm2.user_id = auth.uid()
    )
  );
create policy "room_members_insert" on room_members for insert with check (auth.uid() = user_id);

-- Predictions: user can CRUD their own; room members can read all
create policy "predictions_select" on predictions for select
  using (
    exists (
      select 1 from room_members rm where rm.room_id = room_id and rm.user_id = auth.uid()
    )
  );
create policy "predictions_insert" on predictions for insert with check (auth.uid() = user_id);
create policy "predictions_update" on predictions for update using (auth.uid() = user_id);
create policy "predictions_delete" on predictions for delete using (auth.uid() = user_id);

-- Favourites: same pattern as predictions
create policy "favourites_select" on favourites for select
  using (
    exists (
      select 1 from room_members rm where rm.room_id = room_id and rm.user_id = auth.uid()
    )
  );
create policy "favourites_insert" on favourites for insert with check (auth.uid() = user_id);
create policy "favourites_delete" on favourites for delete using (auth.uid() = user_id);

-- Results: room members can read; admin can insert/update (enforced in app layer)
create policy "results_select" on results for select
  using (
    exists (
      select 1 from room_members rm where rm.room_id = room_id and rm.user_id = auth.uid()
    )
  );
create policy "results_insert" on results for insert
  with check (
    exists (
      select 1 from rooms r where r.id = room_id and r.admin_user_id = auth.uid()
    )
  );
create policy "results_update" on results for update
  using (
    exists (
      select 1 from rooms r where r.id = room_id and r.admin_user_id = auth.uid()
    )
  );

-- Scores: room members can read
create policy "scores_select" on scores for select
  using (
    exists (
      select 1 from room_members rm where rm.room_id = room_id and rm.user_id = auth.uid()
    )
  );
create policy "scores_upsert" on scores for insert with check (true);
create policy "scores_update" on scores for update using (true);
