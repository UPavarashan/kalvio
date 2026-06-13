-- Kalvio full database setup
-- Run in Supabase Dashboard → SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null default '',
  program text not null default '',
  created_at timestamptz not null default now()
);

-- Attendance data (JSON store per user)
create table if not exists public.user_attendance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  store jsonb not null default '{"years":[],"byYear":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

-- GPA data (modules, semester selection, grade scale)
create table if not exists public.user_gpa (
  user_id uuid primary key references auth.users(id) on delete cascade,
  modules_by_semester jsonb not null default '{}'::jsonb,
  selected_semester_id text not null default '2023-24-fall',
  grade_scale jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_attendance enable row level security;
alter table public.user_gpa enable row level security;

-- Profiles policies
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Attendance policies
drop policy if exists "Users read own attendance" on public.user_attendance;
create policy "Users read own attendance"
  on public.user_attendance for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own attendance" on public.user_attendance;
create policy "Users insert own attendance"
  on public.user_attendance for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own attendance" on public.user_attendance;
create policy "Users update own attendance"
  on public.user_attendance for update
  using (auth.uid() = user_id);

-- GPA policies
drop policy if exists "Users read own gpa" on public.user_gpa;
create policy "Users read own gpa"
  on public.user_gpa for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own gpa" on public.user_gpa;
create policy "Users insert own gpa"
  on public.user_gpa for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own gpa" on public.user_gpa;
create policy "Users update own gpa"
  on public.user_gpa for update
  using (auth.uid() = user_id);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_attendance to authenticated;
grant select, insert, update on public.user_gpa to authenticated;

-- Auto-create profile + empty data rows on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, program)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'program', '')
  );

  insert into public.user_attendance (user_id)
  values (new.id);

  insert into public.user_gpa (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
