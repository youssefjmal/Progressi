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
  ('Omek Houria (Carrot Salad)', 110,  2.0, 14.0,  5.5, 100, 'g', 'Tunisian'),

  -- ── Tunisian chips & crisps ───────────────────────────────────────────────
  ('Smile Chips (Nature)',        520,  6.5, 55.0, 30.0,  30, 'g', 'Tunisian Snacks'),
  ('Smile Chips (Fromage)',       525,  6.5, 54.0, 31.0,  30, 'g', 'Tunisian Snacks'),
  ('Smile Chips (BBQ)',           518,  6.0, 55.0, 30.0,  30, 'g', 'Tunisian Snacks'),
  ('Chips Paprika (Generic)',     535,  6.0, 53.0, 33.0,  30, 'g', 'Tunisian Snacks'),
  ('Chips Sel (Generic)',         530,  6.0, 54.0, 32.0,  30, 'g', 'Tunisian Snacks'),
  ('Pop Corn Sucré',              420,  4.0, 78.0, 10.0,  30, 'g', 'Tunisian Snacks'),
  ('Pop Corn Salé',               400,  4.5, 72.0, 11.0,  30, 'g', 'Tunisian Snacks'),

  -- ── Biscuits & wafers ─────────────────────────────────────────────────────
  ('Sablito',                     490,  6.0, 64.0, 22.0,  40, 'g', 'Tunisian Snacks'),
  ('Gauche Wafer (Chocolat)',     515,  6.5, 60.0, 27.0,  35, 'g', 'Tunisian Snacks'),
  ('Gauche Wafer (Vanille)',      510,  6.0, 61.0, 26.0,  35, 'g', 'Tunisian Snacks'),
  ('Prince (LU)',                 480,  6.5, 68.0, 20.0,  42, 'g', 'Tunisian Snacks'),
  ('Tuc Crackers',                490,  9.0, 60.0, 23.0,  30, 'g', 'Tunisian Snacks'),
  ('Biscuit Petit Beurre',        440,  7.0, 70.0, 14.0,  40, 'g', 'Tunisian Snacks'),
  ('Bambino (Pâtes Snack)',       380,  9.5, 72.0,  3.5,  50, 'g', 'Tunisian Snacks'),
  ('Mikado',                      470,  7.0, 62.0, 21.0,  39, 'g', 'Tunisian Snacks'),
  ('BN Chocolat',                 455,  6.0, 69.0, 17.0,  50, 'g', 'Tunisian Snacks'),
  ('Gerblé Biscuit',              410,  8.5, 68.0, 11.0,  50, 'g', 'Tunisian Snacks'),

  -- ── Chocolate & candy ─────────────────────────────────────────────────────
  ('Kinder Bueno',                564, 10.0, 52.0, 35.0,  43, 'g', 'Tunisian Snacks'),
  ('Kinder Chocolat (2 barres)', 546,  8.5, 56.0, 31.0,  42, 'g', 'Tunisian Snacks'),
  ('Twix',                        495,  4.5, 63.0, 24.5,  58, 'g', 'Tunisian Snacks'),
  ('Bounty',                      473,  4.0, 59.0, 24.0,  57, 'g', 'Tunisian Snacks'),
  ('Snickers',                    488,  8.5, 60.0, 24.0,  52, 'g', 'Tunisian Snacks'),
  ('KitKat',                      518,  7.5, 60.0, 27.0,  41, 'g', 'Tunisian Snacks'),
  ('Chocolata (Ulker)',            515,  7.0, 58.0, 28.0,  35, 'g', 'Tunisian Snacks'),
  ('Ferrero Rocher (1 pièce)',    73,  1.2,  5.8,  5.0,  13, 'g', 'Tunisian Snacks'),

  -- ── Instant noodles ───────────────────────────────────────────────────────
  ('Indomie Mi Goreng (préparé)', 405,  8.5, 55.0, 16.5,  85, 'g', 'Tunisian Snacks'),
  ('Indomie Poulet (préparé)',    370,  9.0, 52.0, 13.0,  75, 'g', 'Tunisian Snacks'),
  ('Indomie Bœuf (préparé)',      375,  9.0, 52.0, 13.5,  75, 'g', 'Tunisian Snacks'),
  ('Nouilles Instantanées (sec)', 455,  9.5, 64.0, 17.0,  75, 'g', 'Tunisian Snacks'),

  -- ── Sodas & drinks (per 330 ml can / standard serving) ────────────────────
  ('Boga Orange (330ml)',          148,  0.0, 37.0,  0.0, 330, 'ml', 'Drinks'),
  ('Boga Citron (330ml)',          145,  0.0, 36.0,  0.0, 330, 'ml', 'Drinks'),
  ('Boga Pomme (330ml)',           148,  0.0, 37.0,  0.0, 330, 'ml', 'Drinks'),
  ('Rawaa Jus Orange (200ml)',      86,  0.5, 20.0,  0.0, 200, 'ml', 'Drinks'),
  ('Rawaa Jus Pomme (200ml)',       88,  0.2, 22.0,  0.0, 200, 'ml', 'Drinks'),
  ('Rawaa Jus Ananas (200ml)',      90,  0.3, 22.0,  0.0, 200, 'ml', 'Drinks'),
  ('Coca-Cola (330ml)',            139,  0.0, 35.0,  0.0, 330, 'ml', 'Drinks'),
  ('Pepsi (330ml)',                138,  0.0, 35.0,  0.0, 330, 'ml', 'Drinks'),
  ('Fanta Orange (330ml)',         144,  0.0, 36.0,  0.0, 330, 'ml', 'Drinks'),
  ('Sprite (330ml)',               136,  0.0, 34.0,  0.0, 330, 'ml', 'Drinks'),
  ('Red Bull (250ml)',             113,  1.0, 28.0,  0.0, 250, 'ml', 'Drinks'),
  ('Nescafé (avec lait & sucre)', 120,  3.5, 18.0,  3.5, 200, 'ml', 'Drinks'),
  ('Thé Tunisien Sucré',           60,  0.2, 15.0,  0.0, 200, 'ml', 'Drinks'),
  ('Lben (Lait fermenté 200ml)',   72,  5.5,  9.0,  1.5, 200, 'ml', 'Drinks'),
  ('Jus Grenadine (dilué 200ml)',  80,  0.0, 20.0,  0.0, 200, 'ml', 'Drinks')

ON CONFLICT (name) DO UPDATE
  SET calories     = EXCLUDED.calories,
      protein      = EXCLUDED.protein,
      carbs        = EXCLUDED.carbs,
      fat          = EXCLUDED.fat,
      serving_size = EXCLUDED.serving_size,
      serving_unit = EXCLUDED.serving_unit,
      category     = EXCLUDED.category;
