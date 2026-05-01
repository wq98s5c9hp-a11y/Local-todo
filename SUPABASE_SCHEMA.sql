create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  importance text not null check (importance in ('low', 'medium', 'high')),
  estimated_duration text not null default '',
  due_date date,
  due_time time,
  urgent_before_days integer not null default 1,
  sort_order bigint,
  repeat text not null default 'none' check (repeat in ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  flagged boolean not null default false,
  flag_type text not null default 'red_flag' check (flag_type in ('red_flag', 'green_flag', 'red_circle', 'green_circle', 'red_x', 'green_x')),
  details text not null default '',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

create policy "Users can read their own tasks"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);
