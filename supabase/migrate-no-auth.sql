-- ============================================================
-- Migration: remove Supabase Auth dependency from profiles
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Drop the auth trigger (no longer needed)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- 2. Recreate profiles without auth.users FK and without email
drop table if exists scores cascade;
drop table if exists favourites cascade;
drop table if exists predictions cascade;
drop table if exists results cascade;
drop table if exists room_members cascade;
drop table if exists rooms cascade;
drop table if exists profiles cascade;

-- 3. New profiles table — standalone, no auth dependency
create table profiles (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null,
  created_at    timestamptz default now(),
  constraint display_name_length check (char_length(display_name) between 2 and 30)
);

-- Unique display names (case-insensitive via index)
create unique index profiles_display_name_unique on profiles (lower(display_name));

-- 4. Recreate all other tables (same as before)
create table rooms (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  invite_code   text not null unique,
  admin_user_id uuid not null references profiles(id) on delete cascade,
  locked        boolean not null default false,
  created_at    timestamptz default now()
);

create table room_members (
  id        uuid primary key default gen_random_uuid(),
  room_id   uuid not null references rooms(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

create table contestants (
  id            uuid primary key default gen_random_uuid(),
  country       text not null,
  artist        text not null,
  song          text not null,
  flag_emoji    text not null,
  photo_url     text,
  running_order int,
  created_at    timestamptz default now()
);

create table predictions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  room_id        uuid not null references rooms(id) on delete cascade,
  rank           int not null check (rank between 1 and 10),
  contestant_id  uuid not null references contestants(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(user_id, room_id, rank),
  unique(user_id, room_id, contestant_id)
);

create table favourites (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  room_id        uuid not null references rooms(id) on delete cascade,
  contestant_id  uuid not null references contestants(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(user_id, room_id, contestant_id)
);

create table results (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references rooms(id) on delete cascade,
  rank           int not null check (rank between 1 and 10),
  contestant_id  uuid not null references contestants(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(room_id, rank),
  unique(room_id, contestant_id)
);

create table scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  room_id       uuid not null references rooms(id) on delete cascade,
  total_score   int not null default 0,
  exact_matches int not null default 0,
  in_top10      int not null default 0,
  computed_at   timestamptz default now(),
  unique(user_id, room_id)
);

-- 5. RLS — disable entirely, all access via service role key on the server
alter table profiles      disable row level security;
alter table rooms         disable row level security;
alter table room_members  disable row level security;
alter table contestants   disable row level security;
alter table predictions   disable row level security;
alter table favourites    disable row level security;
alter table results       disable row level security;
alter table scores        disable row level security;
