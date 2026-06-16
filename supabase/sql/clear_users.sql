-- Reset all Kalvio accounts (run in Supabase Dashboard → SQL Editor)
-- Deletes every auth user; profiles, attendance, and GPA cascade automatically.

delete from auth.users;
