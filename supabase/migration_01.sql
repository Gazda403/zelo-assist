-- Add missing columns to bots table to match EmailBot type
alter table public.bots 
add column if not exists description text,
add column if not exists enabled boolean default true,
add column if not exists is_premium boolean default false,
add column if not exists trigger jsonb default '{}'::jsonb,
add column if not exists conditions jsonb default '[]'::jsonb,
add column if not exists actions jsonb default '[]'::jsonb,
add column if not exists safety jsonb default '{}'::jsonb,
add column if not exists stats jsonb default '{}'::jsonb,
add column if not exists accepted_terms_at timestamp with time zone,
add column if not exists accepted_terms_version text;

-- Add a table for Bot Execution Logs if we want to store them independently
create table if not exists public.bot_execution_logs (
  id uuid default gen_random_uuid() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  email_id text,
  triggered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('success', 'failure', 'safety_blocked')),
  actions_executed text[], -- array of strings
  error_message text,
  metadata jsonb
);

alter table public.bot_execution_logs enable row level security;

create policy "Users can view logs for their bots" on public.bot_execution_logs
  for select using (
    exists (
      select 1 from public.bots
      where public.bots.id = public.bot_execution_logs.bot_id
      and public.bots.user_id = auth.uid()
    )
  );

-- Allow insert/update? Usually logs are just inserted.
-- We might want to allow the server to insert them.
create policy "Users can insert logs for their bots" on public.bot_execution_logs
  for insert with check (
    exists (
      select 1 from public.bots
      where public.bots.id = public.bot_execution_logs.bot_id
      and public.bots.user_id = auth.uid()
    )
  );
