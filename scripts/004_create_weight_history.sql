-- Create weight_history table
create table if not exists public.weight_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight numeric not null,
  recorded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index weight_history_user_id on public.weight_history(user_id);
create index weight_history_recorded_at on public.weight_history(recorded_at);

alter table public.weight_history enable row level security;

create policy "weight_history_select_own" on public.weight_history for select using (auth.uid() = user_id);
create policy "weight_history_insert_own" on public.weight_history for insert with check (auth.uid() = user_id);
create policy "weight_history_update_own" on public.weight_history for update using (auth.uid() = user_id);
create policy "weight_history_delete_own" on public.weight_history for delete using (auth.uid() = user_id);
