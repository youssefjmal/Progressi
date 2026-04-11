-- Tunisian cooked dishes — calories per 100g (cooked weight)
-- Macros estimated from traditional recipes and USDA equivalents
INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES

  -- ── Pasta dishes ──────────────────────────────────────────────────────────
  ('Makrouna b Salsa',          160,  6.0, 26.0,  3.5, 100, 'g', 'Tunisian'),
  ('Makrouna b Salsa (viande)', 195,  9.5, 24.0,  6.0, 100, 'g', 'Tunisian'),
  ('Makrouna Marka Bitha',      175,  7.0, 26.0,  4.5, 100, 'g', 'Tunisian'),

  -- ── Thin pasta / vermicelli ────────────────────────────────────────────────
  ('Douida Marka',              145,  5.5, 22.0,  3.5, 100, 'g', 'Tunisian'),
  ('Douida b Lham',             185,  9.0, 21.0,  6.5, 100, 'g', 'Tunisian'),
  ('Douida b Djej',             170,  9.5, 20.0,  5.0, 100, 'g', 'Tunisian'),

  -- ── Couscous dishes ────────────────────────────────────────────────────────
  ('Kosksi b Khodhra',          155,  5.0, 26.0,  3.0, 100, 'g', 'Tunisian'),
  ('Kosksi b Lham',             195, 10.0, 24.0,  6.5, 100, 'g', 'Tunisian'),
  ('Kosksi b Djej',             180,  9.5, 24.0,  5.0, 100, 'g', 'Tunisian'),
  ('Mfawra (Kosksi b Hlib)',     210,  7.0, 32.0,  6.0, 100, 'g', 'Tunisian'),

  -- ── Offal & specialty ─────────────────────────────────────────────────────
  ('Osban (3osben)',             260, 16.0,  8.0, 18.0, 100, 'g', 'Tunisian'),
  ('Kwajem (Jwajem)',            280, 17.0,  6.0, 20.0, 100, 'g', 'Tunisian'),
  ('Kamounia (Kibda)',           210, 18.0,  5.0, 13.0, 100, 'g', 'Tunisian'),
  ('Gallouch (Tripe Stew)',      180, 15.0,  5.0, 11.0, 100, 'g', 'Tunisian'),

  -- ── Roasted / grilled meat ────────────────────────────────────────────────
  ('Mosli (Roasted Lamb)',       285, 24.0,  1.0, 20.0, 100, 'g', 'Tunisian'),
  ('Mosli Djej (Roasted Chicken)', 215, 26.0, 1.0, 12.0, 100, 'g', 'Tunisian'),
  ('Grillades Agneau',           265, 25.0,  0.0, 18.0, 100, 'g', 'Tunisian'),
  ('Kafteji',                    190, 10.0, 14.0, 11.0, 100, 'g', 'Tunisian'),

  -- ── Stews (marqa) ──────────────────────────────────────────────────────────
  ('Marqa Hamra b Lham',         185, 12.0,  8.0, 11.0, 100, 'g', 'Tunisian'),
  ('Marqa Bitha b Djej',         165, 11.0,  8.0,  9.0, 100, 'g', 'Tunisian'),
  ('Marqa b Khodhra',            130,  7.0, 10.0,  7.0, 100, 'g', 'Tunisian'),
  ('Tajine Tunisien',            220, 14.0,  8.0, 14.0, 100, 'g', 'Tunisian'),
  ('Chakchouka',                 110,  6.0,  9.0,  6.0, 100, 'g', 'Tunisian'),
  ('Ojja b Merguez',             195, 13.0,  7.0, 13.0, 100, 'g', 'Tunisian'),
  ('Ojja b Djej',                170, 14.0,  6.0, 10.0, 100, 'g', 'Tunisian'),

  -- ── Soups ─────────────────────────────────────────────────────────────────
  ('Lablebi',                    155,  7.0, 22.0,  4.5, 100, 'g', 'Tunisian'),
  ('Chorba Frik',                120,  6.5, 16.0,  3.0, 100, 'g', 'Tunisian'),
  ('Chorba b Lham',              140,  9.0, 14.0,  5.0, 100, 'g', 'Tunisian'),
  ('Hsou (Porridge)',             95,  3.5, 16.0,  1.5, 100, 'g', 'Tunisian'),

  -- ── Legumes ───────────────────────────────────────────────────────────────
  ('Loubia Marka',               135,  7.0, 20.0,  2.5, 100, 'g', 'Tunisian'),
  ('Hamiss (Chickpea Salad)',     160,  8.0, 22.0,  4.0, 100, 'g', 'Tunisian'),
  ('Ful Mdammas',                155,  9.0, 22.0,  3.5, 100, 'g', 'Tunisian'),

  -- ── Fried / baked ─────────────────────────────────────────────────────────
  ('Brik à l''Oeuf',             220,  8.0, 18.0, 13.0,  85, 'g', 'Tunisian'),
  ('Brik au Thon',               215,  9.0, 17.0, 12.0,  85, 'g', 'Tunisian'),
  ('Fricassé',                   380, 14.0, 38.0, 19.0, 130, 'g', 'Tunisian'),
  ('Mlawi (Msemen)',             310,  7.0, 42.0, 12.0, 100, 'g', 'Tunisian'),
  ('Ftayer (Samsa)',             310,  8.0, 35.0, 15.0, 100, 'g', 'Tunisian'),

  -- ── Rice dishes ───────────────────────────────────────────────────────────
  ('Roz b Lham',                 200, 10.0, 26.0,  6.0, 100, 'g', 'Tunisian'),
  ('Roz b Djej',                 185,  9.5, 25.0,  5.0, 100, 'g', 'Tunisian'),

  -- ── Salads & sides ────────────────────────────────────────────────────────
  ('Slata Mechouia',              70,  2.5,  7.0,  4.0, 100, 'g', 'Tunisian'),
  ('Slata Tounsia',               65,  1.5,  6.0,  4.0, 100, 'g', 'Tunisian'),
  ('Omek Houria (Carrot Salad)', 110,  2.0, 14.0,  5.5, 100, 'g', 'Tunisian')

ON CONFLICT (name) DO UPDATE
  SET calories     = EXCLUDED.calories,
      protein      = EXCLUDED.protein,
      carbs        = EXCLUDED.carbs,
      fat          = EXCLUDED.fat,
      serving_size = EXCLUDED.serving_size,
      serving_unit = EXCLUDED.serving_unit,
      category     = EXCLUDED.category;
