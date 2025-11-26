-- Create recipes table for Pro tier
create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  target_emotion text not null,
  duration text not null default '60 seconds',
  steps jsonb not null,
  why_this_works text not null,
  is_favorite boolean default false,
  use_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used_at timestamp with time zone
);

-- Enable Row Level Security
alter table public.recipes enable row level security;

-- Create policies
create policy "Users can view their own recipes"
  on public.recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- Create index for performance
create index recipes_user_id_created_at_idx
  on public.recipes(user_id, created_at desc);
create index recipes_user_id_is_favorite_idx
  on public.recipes(user_id, is_favorite);


