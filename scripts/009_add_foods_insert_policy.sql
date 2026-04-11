-- Allow authenticated users to insert new foods (needed for AI chat food logging)
CREATE POLICY "foods_insert_authenticated"
  ON public.foods
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
