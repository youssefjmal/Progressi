alter table public.exercise_logs
  alter column duration drop not null,
  alter column duration drop default;

alter table public.exercise_logs
  add column if not exists total_volume decimal(10,2),
  add column if not exists estimated_1rm decimal(10,2);
