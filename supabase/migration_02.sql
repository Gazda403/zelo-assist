-- Migration 02: Decouple from Supabase Auth (Support NextAuth Email IDs)

-- 1. Drop ALL policies that might reference the columns we are changing
-- Table: bots
drop policy if exists "Users can view their own bots." on public.bots;
drop policy if exists "Users can create their own bots." on public.bots;
drop policy if exists "Users can update their own bots." on public.bots;
drop policy if exists "Users can delete their own bots." on public.bots;

-- Table: profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

-- Table: analytics_events
drop policy if exists "Users can insert their own events." on public.analytics_events;
drop policy if exists "Users can view their own events." on public.analytics_events;

-- Table: bot_execution_logs (References bots.user_id)
drop policy if exists "Users can view logs for their bots" on public.bot_execution_logs;
drop policy if exists "Users can insert logs for their bots" on public.bot_execution_logs;

-- 2. Drop FK constraints
alter table public.bots drop constraint if exists bots_user_id_fkey;
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.analytics_events drop constraint if exists analytics_events_user_id_fkey;

-- 3. Alter columns to be TEXT
alter table public.bots alter column user_id type text;
alter table public.profiles alter column id type text;
alter table public.analytics_events alter column user_id type text;

-- 4. Re-Create Policies (Optional)
-- Since we use Server Actions with Service Role, we will skip recreating complex RLS policies for now.
-- We verify ownership in the application logic (NextAuth session vs database record).

-- Add a basic policy to "bot_execution_logs" if needed, or leave it effectively "service role only" (default deny for anon).
