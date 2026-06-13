-- Fix "Database error saving new user" on signup
-- Run once in Supabase Dashboard → SQL Editor

-- 1. Rename program → course if needed
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'program'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'course'
  ) then
    alter table public.profiles rename column program to course;
  end if;
end $$;

-- 2. Signup trigger that works with either column name
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_course boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'course'
  ) into has_course;

  if has_course then
    insert into public.profiles (id, email, name, course)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'name', ''),
      coalesce(new.raw_user_meta_data->>'course', '')
    );
  else
    insert into public.profiles (id, email, name, program)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'name', ''),
      coalesce(new.raw_user_meta_data->>'course', '')
    );
  end if;

  insert into public.user_attendance (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_gpa (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
