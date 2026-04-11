-- Tunisian dro3 (braised/grilled arm meat) and chamiya (sweet confection)

INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES

  -- ── Dro3 (درع) – lamb/beef arm/shoulder cuts ─────────────────────────────
  ('Dro3 Agneau Grillé',            210, 26.0,  0.0, 12.0, 100, 'g', 'Tunisian Dishes'),
  ('Dro3 Agneau Mijoté (Marka)',    195, 24.0,  2.5, 10.0, 100, 'g', 'Tunisian Dishes'),
  ('Dro3 Bœuf Grillé',             215, 27.5,  0.0, 12.5, 100, 'g', 'Tunisian Dishes'),
  ('Dro3 Méchoui (au Four)',        220, 25.0,  1.0, 13.0, 100, 'g', 'Tunisian Dishes'),
  ('Dro3 Complet (portion)',        430, 50.0,  2.0, 25.0, 200, 'g', 'Tunisian Dishes'),

  -- ── Chamiya (شامية) – Tunisian nut & honey confection ───────────────────
  ('Chamiya Nature',                520,  8.0, 45.0, 34.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya aux Amandes',           540,  9.5, 43.0, 36.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya aux Cacahuètes',        530,  9.0, 44.0, 35.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya au Sésame',             515,  9.0, 46.0, 33.0,  60, 'g', 'Tunisian Sweets'),
  ('Chamiya Miel & Noix',           545, 10.0, 47.0, 35.5,  60, 'g', 'Tunisian Sweets')

ON CONFLICT DO NOTHING;
