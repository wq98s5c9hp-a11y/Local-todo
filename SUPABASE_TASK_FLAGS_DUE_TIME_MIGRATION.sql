alter table public.tasks
add column if not exists due_time time;

alter table public.tasks
add column if not exists flagged boolean not null default false;

alter table public.tasks
add column if not exists flag_type text not null default 'red_flag';

alter table public.tasks
drop constraint if exists tasks_flag_type_check;

alter table public.tasks
add constraint tasks_flag_type_check
check (
  flag_type in (
    'red_flag',
    'green_flag',
    'red_circle',
    'green_circle',
    'red_x',
    'green_x'
  )
);
