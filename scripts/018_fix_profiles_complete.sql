-- Fix profiles table: add all missing columns
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS calorie_target   INTEGER,
  ADD COLUMN IF NOT EXISTS weight_loss_rate DECIMAL(4,2) DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS protein_target   INTEGER,
  ADD COLUMN IF NOT EXISTS carbs_target     INTEGER,
  ADD COLUMN IF NOT EXISTS fat_target       INTEGER;

-- Ensure updated_at column exists
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Re-create the trigger function to keep updated_at fresh on every save
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
