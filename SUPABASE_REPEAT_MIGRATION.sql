alter table public.tasks
add column if not exists repeat text not null default 'none';

alter table public.tasks
drop constraint if exists tasks_repeat_check;

alter table public.tasks
add constraint tasks_repeat_check
check (repeat in ('none', 'daily', 'weekly', 'monthly', 'yearly'));
