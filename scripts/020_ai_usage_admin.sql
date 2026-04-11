-- AI usage tracking + admin support
-- Run this in Supabase SQL Editor

-- ── 1. ai_usage: track per-user per-day AI call counts ────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id            UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE      NOT NULL DEFAULT CURRENT_DATE,
  feedback_calls INTEGER  NOT NULL DEFAULT 0,
  chat_calls     INTEGER  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_manage_own" ON public.ai_usage
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_usage_user_date_idx
  ON public.ai_usage (user_id, date DESC);

CREATE INDEX IF NOT EXISTS ai_usage_date_idx
  ON public.ai_usage (date DESC);

-- ── 2. Atomic increment function (avoids race conditions on concurrent calls) ──
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id UUID,
  p_date    DATE,
  p_column  TEXT   -- 'feedback_calls' or 'chat_calls'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_usage (user_id, date, feedback_calls, chat_calls)
  VALUES (
    p_user_id,
    p_date,
    CASE WHEN p_column = 'feedback_calls' THEN 1 ELSE 0 END,
    CASE WHEN p_column = 'chat_calls'     THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    feedback_calls = ai_usage.feedback_calls
      + CASE WHEN p_column = 'feedback_calls' THEN 1 ELSE 0 END,
    chat_calls = ai_usage.chat_calls
      + CASE WHEN p_column = 'chat_calls' THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$;

-- ── 3. Add email column to profiles (stored at sign-up) ───────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- ── 4. Update handle_new_user trigger to persist email ────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, language, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ── 5. Admin read policy on profiles (service role bypasses RLS, but explicit) ─
-- Allow the admin service role to read all profiles (it bypasses RLS by default)
-- No extra policy needed — service role key ignores RLS.

-- ── 6. Backfill emails for existing users where possible ─────────────────────
-- This updates profiles.email from auth.users for any existing row missing it.
-- Safe to run multiple times.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');
