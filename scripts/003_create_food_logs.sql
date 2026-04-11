-- Create food_logs table
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid not null,
  meal_type text not null,
  quantity numeric not null,
  unit text not null,
  calories numeric not null,
  protein numeric,
  carbs numeric,
  fat numeric,
  logged_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index food_logs_user_id on public.food_logs(user_id);
create index food_logs_logged_at on public.food_logs(logged_at);

alter table public.food_logs enable row level security;

create policy "food_logs_select_own" on public.food_logs for select using (auth.uid() = user_id);
create policy "food_logs_insert_own" on public.food_logs for insert with check (auth.uid() = user_id);
create policy "food_logs_update_own" on public.food_logs for update using (auth.uid() = user_id);
create policy "food_logs_delete_own" on public.food_logs for delete using (auth.uid() = user_id);
