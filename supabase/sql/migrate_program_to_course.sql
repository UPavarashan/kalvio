-- Rename profiles.program → course (run once in Supabase SQL Editor)
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

-- Recreate signup trigger to use course column
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, course)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'course', '')
  );

  insert into public.user_attendance (user_id)
  values (new.id);

  insert into public.user_gpa (user_id)
  values (new.id);

  return new;
end;
$$;
