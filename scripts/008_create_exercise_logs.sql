-- Exercise logs table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Strength',
  duration INTEGER,
  calories_burned INTEGER NOT NULL DEFAULT 0,
  sets INTEGER,
  reps INTEGER,
  weight_used DECIMAL(6,2),
  total_volume DECIMAL(10,2),
  estimated_1rm DECIMAL(10,2),
  logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row Level Security
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercise logs"
  ON exercise_logs FOR ALL
  USING (auth.uid() = user_id);

-- Index for fast date queries
CREATE INDEX IF NOT EXISTS exercise_logs_user_date_idx ON exercise_logs (user_id, logged_at DESC);
