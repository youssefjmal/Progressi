-- Tunisian dro3/sorgho (درع = sorghum) and chamiya (sweet confection)

INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES

  -- ── Dro3 / Sorgho (درع) – sorghum grain & dishes ─────────────────────────
  ('Sorgho (Dro3) Grain Cuit',       329,  8.7, 72.0,  3.3, 100, 'g', 'Tunisian Dishes'),
  ('Sorgho (Dro3) Grain Sec',        339, 11.3, 74.6,  3.5, 100, 'g', 'Tunisian Dishes'),
  ('Assida Dro3 (Sorgho)',           180,  3.5, 38.0,  1.5, 200, 'g', 'Tunisian Dishes'),
  ('Farine de Sorgho (Dro3)',        339,  8.5, 74.0,  3.5, 100, 'g', 'Tunisian Dishes'),
  ('Bouillie de Sorgho (Dro3)',      105,  2.5, 22.0,  1.0, 200, 'g', 'Tunisian Dishes'),
  ('Dro3 au Lait',                   175,  6.5, 28.0,  4.5, 250, 'g', 'Tunisian Dishes'),

  -- ── Chamiya (شامية) – Tunisian nut & honey confection ───────────────────
  ('Chamiya Nature',                 520,  8.0, 45.0, 34.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya aux Amandes',            540,  9.5, 43.0, 36.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya aux Cacahuètes',         530,  9.0, 44.0, 35.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya au Sésame',              515,  9.0, 46.0, 33.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya Miel & Noix',            545, 10.0, 47.0, 35.5,  60, 'g', 'Tunisian Sweets')

ON CONFLICT DO NOTHING;
