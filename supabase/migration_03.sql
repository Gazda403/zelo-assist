-- Migration 03: Create email_ratings table for persistent AI memory

create table if not exists public.email_ratings (
  email_id text primary key,
  user_id text not null,
  urgency_score int,
  reasoning text,
  confidence text,
   -- 'classification' usage depends on what rateEmailFlow returns, usually just score/reasoning
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.email_ratings enable row level security;

-- Policies (Basic Service Role access is implied, adding these for completeness/future client access)
create policy "Users can view their own email ratings" on public.email_ratings
  for select using (user_id = auth.uid()::text);

create policy "Users can insert their own email ratings" on public.email_ratings
  for insert with check (user_id = auth.uid()::text);
