-- Pre-deploy fixes
-- Run this in Supabase SQL Editor

-- ── 1. weight_history: rename weight → weight_kg, add note column ──────────────
-- The app code uses weight_kg and note but the original table only had weight
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'weight_history'
      AND column_name  = 'weight'
  ) THEN
    ALTER TABLE public.weight_history RENAME COLUMN weight TO weight_kg;
  END IF;
END $$;

ALTER TABLE public.weight_history
  ADD COLUMN IF NOT EXISTS note TEXT;

-- ── 2. foods: unique index on name for safe upsert (dedup) ────────────────────
-- Remove duplicate names first (keep the row with the latest created_at)
DELETE FROM public.foods f1
USING public.foods f2
WHERE f1.created_at < f2.created_at
  AND lower(f1.name) = lower(f2.name);

-- Plain unique constraint on name — required for Supabase upsert onConflict: 'name'
-- (expression indexes like lower(name) can't be referenced by the JS client)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'foods_name_uq'
      AND table_name = 'foods'
  ) THEN
    ALTER TABLE public.foods ADD CONSTRAINT foods_name_uq UNIQUE (name);
  END IF;
END $$;

-- ── 3. food_logs: composite index for per-user date queries ───────────────────
-- Replaces the two separate indexes with one covering (user_id, logged_at)
CREATE INDEX IF NOT EXISTS food_logs_user_logged_idx
  ON public.food_logs (user_id, logged_at DESC);

-- ── 4. FK: food_logs.food_id → foods(id) ─────────────────────────────────────
-- Only add if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'food_logs_food_id_fkey'
      AND table_name = 'food_logs'
  ) THEN
    ALTER TABLE public.food_logs
      ADD CONSTRAINT food_logs_food_id_fkey
      FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE CASCADE;
  END IF;
END $$;
