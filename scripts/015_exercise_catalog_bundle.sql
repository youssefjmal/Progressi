-- Exercise catalog bundle
-- Run this file in Supabase SQL Editor to create and seed the public.exercises table.

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

insert into public.exercises (name, category, met)
values
  ('Running (8 km/h)', 'Cardio', 8.3),
  ('Running (12 km/h)', 'Cardio', 11.5),
  ('Running (intervals)', 'Cardio', 10.5),
  ('Sprinting', 'Cardio', 15.0),
  ('Cycling (moderate)', 'Cardio', 6.8),
  ('Cycling (vigorous)', 'Cardio', 10.0),
  ('Elliptical Trainer', 'Cardio', 5.0),
  ('Rowing Machine', 'Cardio', 7.0),
  ('Jump Rope', 'Cardio', 11.8),
  ('Swimming', 'Cardio', 8.0),
  ('Walking (5 km/h)', 'Cardio', 3.5),
  ('Walking (brisk)', 'Cardio', 4.8),
  ('Stair Climber', 'Cardio', 8.8),
  ('Dance Cardio', 'Cardio', 6.5),
  ('HIIT', 'Cardio', 10.0),
  ('Boxing', 'Cardio', 7.8),
  ('Bench Press', 'Strength', 5.0),
  ('Close-Grip Bench Press', 'Strength', 5.0),
  ('Paused Bench Press', 'Strength', 5.0),
  ('Dumbbell Shoulder Press', 'Strength', 5.0),
  ('Seated Dumbbell Shoulder Press', 'Strength', 5.0),
  ('Arnold Press', 'Strength', 5.0),
  ('Incline Dumbbell Press', 'Strength', 5.0),
  ('Incline Smith Machine Press', 'Strength', 5.0),
  ('Incline Barbell Press', 'Strength', 5.0),
  ('Flat Dumbbell Press', 'Strength', 5.0),
  ('Machine Chest Press', 'Strength', 4.5),
  ('Cable Fly', 'Strength', 3.8),
  ('Pec Deck', 'Strength', 3.8),
  ('Squat', 'Strength', 5.5),
  ('Front Squat', 'Strength', 5.5),
  ('Hack Squat', 'Strength', 5.0),
  ('Bulgarian Split Squat', 'Strength', 5.0),
  ('Leg Press', 'Strength', 5.0),
  ('Leg Extension', 'Strength', 3.8),
  ('Leg Curl', 'Strength', 3.8),
  ('Calf Raise', 'Strength', 3.5),
  ('Deadlift', 'Strength', 6.0),
  ('Romanian Deadlift', 'Strength', 5.5),
  ('Stiff-Leg Deadlift', 'Strength', 5.5),
  ('Smith Machine Romanian Deadlift', 'Strength', 5.0),
  ('Pull-ups', 'Strength', 5.5),
  ('Chin-ups', 'Strength', 5.5),
  ('Lat Pulldown', 'Strength', 4.5),
  ('Machine Row', 'Strength', 4.5),
  ('Chest-Supported Row', 'Strength', 4.5),
  ('Single-Arm Dumbbell Row', 'Strength', 4.5),
  ('Seated Cable Row', 'Strength', 4.5),
  ('Barbell Row', 'Strength', 5.0),
  ('Barbell Bent-Over Row', 'Strength', 5.0),
  ('Shoulder Press', 'Strength', 5.0),
  ('Lateral Raise', 'Strength', 3.5),
  ('Rear Delt Fly', 'Strength', 3.5),
  ('Face Pull', 'Strength', 3.5),
  ('JM Press', 'Strength', 4.5),
  ('Biceps Curl', 'Strength', 3.5),
  ('Hammer Curl', 'Strength', 3.5),
  ('Preacher Curl', 'Strength', 3.5),
  ('Triceps Pushdown', 'Strength', 3.5),
  ('Skull Crusher', 'Strength', 4.0),
  ('Overhead Triceps Extension', 'Strength', 3.8),
  ('Lunges', 'Strength', 4.5),
  ('Hip Thrust', 'Strength', 5.0),
  ('Glute Bridge', 'Strength', 4.0),
  ('Plank', 'Strength', 3.3),
  ('Cable Crunch', 'Strength', 3.8),
  ('Hanging Leg Raise', 'Strength', 4.0),
  ('Cable Machine Workout', 'Strength', 4.5),
  ('Weight Training (general)', 'Strength', 4.0),
  ('Yoga', 'Recovery', 3.0),
  ('Pilates', 'Recovery', 3.0),
  ('Stretching', 'Recovery', 2.3),
  ('Mobility Session', 'Recovery', 2.8),
  ('Foam Rolling', 'Recovery', 2.0),
  ('Breathwork', 'Recovery', 1.5),
  ('Football', 'Sports', 8.0),
  ('Basketball', 'Sports', 6.5),
  ('Tennis', 'Sports', 7.3),
  ('Padel', 'Sports', 6.0),
  ('Volleyball', 'Sports', 4.0),
  ('Martial Arts', 'Sports', 10.3),
  ('Handball', 'Sports', 8.0)
on conflict (name) do update
set
  category = excluded.category,
  met = excluded.met;
