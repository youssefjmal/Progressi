-- Add missing calorie_target column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS calorie_target INTEGER;
