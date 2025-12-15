-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Events Table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Photos Table
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  image_url text not null,
  source_type text not null, -- 'url' or 'upload' or 'drive_folder'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;
alter table public.photos enable row level security;

-- Create Policies (Allow public read for now, easier for this stage)
-- Ideally, write access should be restricted to authenticated users
create policy "Public events are viewable by everyone" on public.events
  for select using (true);

create policy "Events are insertable by everyone" on public.events
  for insert with check (true);

create policy "Public photos are viewable by everyone" on public.photos
  for select using (true);

create policy "Photos are insertable by everyone" on public.photos
  for insert with check (true);

-- STORAGE SETUP
-- Create a storage bucket called 'photos'
insert into storage.buckets (id, name, public) 
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Storage Policy: Allow public access
create policy "Public Access" on storage.objects for select
using ( bucket_id = 'photos' );

create policy "Public Upload" on storage.objects for insert
with check ( bucket_id = 'photos' );
