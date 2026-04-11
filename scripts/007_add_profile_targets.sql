-- Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS weight_loss_rate DECIMAL(4,2) DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS protein_target INTEGER,
  ADD COLUMN IF NOT EXISTS carbs_target INTEGER,
  ADD COLUMN IF NOT EXISTS fat_target INTEGER;
