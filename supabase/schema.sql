-- Create a table for public profiles (optional, but good practice)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- Create a table for Bots
create table if not exists public.bots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  prompt text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bots enable row level security;

create policy "Users can view their own bots." on public.bots
  for select using ((select auth.uid()) = user_id);

create policy "Users can create their own bots." on public.bots
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own bots." on public.bots
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own bots." on public.bots
  for delete using ((select auth.uid()) = user_id);

-- Create a table for Analytics Events
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users, -- can be null for anonymous events if needed, but usually we track user
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analytics_events enable row level security;

create policy "Users can insert their own events." on public.analytics_events
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can view their own events." on public.analytics_events
  for select using ((select auth.uid()) = user_id);

-- Function to handle new user signup (automatically create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
