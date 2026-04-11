-- Create foods table (curated food database)
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  calories numeric not null,
  protein numeric,
  carbs numeric,
  fat numeric,
  serving_size numeric not null,
  serving_unit text not null default 'g',
  category text,
  created_at timestamp with time zone default now()
);

create index if not exists foods_name on public.foods(name);
create index if not exists foods_category on public.foods(category);

alter table public.foods enable row level security;

-- Public read access to foods table
drop policy if exists "foods_select_all" on public.foods;
create policy "foods_select_all" on public.foods for select using (true);
