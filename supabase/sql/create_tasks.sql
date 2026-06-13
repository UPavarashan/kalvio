-- Kalvio: tasks table for Supabase connection testing
-- Run this in Supabase Dashboard → SQL Editor → New query

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "Allow anon read for testing" on public.tasks;
create policy "Allow anon read for testing"
  on public.tasks
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow anon insert for testing" on public.tasks;
create policy "Allow anon insert for testing"
  on public.tasks
  for insert
  to anon, authenticated
  with check (true);

grant select, insert on public.tasks to anon, authenticated;

insert into public.tasks (title, description, completed)
select *
from (
  values
    ('Review lecture notes', 'CS101 week 3 materials', false),
    ('Submit assignment', 'Due Friday at 11:59pm', true),
    ('Prepare for midterm', 'Chapters 1-5', false)
) as seed(title, description, completed)
where not exists (select 1 from public.tasks limit 1);
