-- Curated exercise catalog used by the workout logger
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  met numeric not null,
  created_at timestamp with time zone default now()
);

create index if not exists exercises_category_idx on public.exercises(category);
create index if not exists exercises_name_idx on public.exercises(name);

alter table public.exercises enable row level security;

drop policy if exists "exercises_select_all" on public.exercises;
create policy "exercises_select_all" on public.exercises for select using (true);
