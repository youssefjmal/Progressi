CREATE TABLE IF NOT EXISTS public.daily_wellness (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_ml INTEGER NOT NULL DEFAULT 0,
  step_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tracking_date)
);

ALTER TABLE public.daily_wellness ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_wellness_manage_own" ON public.daily_wellness;
CREATE POLICY "daily_wellness_manage_own"
  ON public.daily_wellness FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS daily_wellness_user_date_idx
  ON public.daily_wellness (user_id, tracking_date DESC);
