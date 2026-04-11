-- Fix biscuit serving sizes: all values were already per 100g but serving_size
-- was set to the package portion (35–55g), causing the app to massively under-report.
-- Standardise all biscuits/snacks to serving_size = 100g and correct macros.

UPDATE public.foods SET calories = 519, protein = 6.5, carbs = 63.0, fat = 27.0, serving_size = 100 WHERE name = 'Chocotom (Romy)';
UPDATE public.foods SET calories = 516, protein = 6.5, carbs = 64.0, fat = 26.5, serving_size = 100 WHERE name = 'Chocotom Smile';
UPDATE public.foods SET calories = 465, protein = 7.0, carbs = 67.0, fat = 18.0, serving_size = 100 WHERE name = 'Smile Biscuit Nature';
UPDATE public.foods SET calories = 475, protein = 7.0, carbs = 65.0, fat = 19.5, serving_size = 100 WHERE name = 'Smile Biscuit Chocolat';
UPDATE public.foods SET calories = 430, protein = 7.5, carbs = 70.0, fat = 13.0, serving_size = 100 WHERE name = 'Biscotto (Sotubi)';
UPDATE public.foods SET calories = 500, protein = 7.0, carbs = 60.0, fat = 25.0, serving_size = 100 WHERE name = 'Bastoncini Chocolat';
UPDATE public.foods SET calories = 435, protein = 6.5, carbs = 68.0, fat = 15.0, serving_size = 100 WHERE name = 'Margherita Vanille';
UPDATE public.foods SET calories = 445, protein = 6.5, carbs = 67.0, fat = 16.5, serving_size = 100 WHERE name = 'Margherita Chocolat';
UPDATE public.foods SET calories = 480, protein = 5.5, carbs = 66.0, fat = 21.0, serving_size = 100 WHERE name = 'Ringo (Mondelez)';
UPDATE public.foods SET calories = 400, protein = 4.5, carbs = 65.0, fat = 13.5, serving_size = 100 WHERE name = 'Chamonix (LU)';
UPDATE public.foods SET calories = 445, protein = 5.5, carbs = 64.0, fat = 18.5, serving_size = 100 WHERE name = 'Napolitain Chocolat (LU)';
UPDATE public.foods SET calories = 490, protein = 6.5, carbs = 64.0, fat = 22.0, serving_size = 100 WHERE name = 'LU Petit Écolier Chocolat';
UPDATE public.foods SET calories = 460, protein = 7.0, carbs = 63.0, fat = 19.5, serving_size = 100 WHERE name = 'Granola Chocolat (LU)';
UPDATE public.foods SET calories = 490, protein = 6.0, carbs = 63.0, fat = 23.0, serving_size = 100 WHERE name = 'Pépito Chocolat (LU)';
UPDATE public.foods SET calories = 471, protein = 5.0, carbs = 67.0, fat = 20.5, serving_size = 100 WHERE name = 'Oreo Original';
UPDATE public.foods SET calories = 482, protein = 5.5, carbs = 66.0, fat = 22.0, serving_size = 100 WHERE name = 'Oreo Chocolat Double';
UPDATE public.foods SET calories = 471, protein = 7.5, carbs = 62.0, fat = 20.5, serving_size = 100 WHERE name = 'Digestive McVitie''s Nature';
UPDATE public.foods SET calories = 487, protein = 6.5, carbs = 62.0, fat = 23.0, serving_size = 100 WHERE name = 'Digestive McVitie''s Chocolat';
UPDATE public.foods SET calories = 490, protein = 8.0, carbs = 69.0, fat = 19.5, serving_size = 100 WHERE name = 'Leibniz Butter Biscuit';
UPDATE public.foods SET calories = 500, protein = 7.5, carbs = 64.0, fat = 23.5, serving_size = 100 WHERE name = 'Ritz Crackers';
UPDATE public.foods SET calories = 395, protein = 5.5, carbs = 62.0, fat = 13.5, serving_size = 100 WHERE name = 'Grany Fruits (LU)';
UPDATE public.foods SET calories = 375, protein = 9.5, carbs = 70.0, fat =  5.0, serving_size = 100 WHERE name = 'Cracotte Blé Complet';
UPDATE public.foods SET calories = 400, protein = 5.5, carbs = 52.0, fat = 19.0, serving_size = 100 WHERE name = 'Madeleine Brossard';
UPDATE public.foods SET calories = 540, protein = 9.0, carbs = 61.0, fat = 28.0, serving_size = 100 WHERE name = 'Nutella B-ready';
UPDATE public.foods SET calories = 536, protein = 9.5, carbs = 60.0, fat = 28.5, serving_size = 100 WHERE name = 'Kinder Cards';
UPDATE public.foods SET calories = 440, protein = 7.0, carbs = 68.0, fat = 15.0, serving_size = 100 WHERE name = 'Biscuit Cacao (Générique)';
UPDATE public.foods SET calories = 490, protein = 5.5, carbs = 63.0, fat = 24.0, serving_size = 100 WHERE name = 'Wafer Vanille (Générique)';
UPDATE public.foods SET calories = 485, protein = 5.5, carbs = 64.0, fat = 23.5, serving_size = 100 WHERE name = 'Wafer Fraise (Générique)';

-- Add Sablito (missing from previous script)
INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES ('Sablito (Sotubi)', 519, 6.0, 65.0, 26.0, 100, 'g', 'Tunisian Snacks')
ON CONFLICT DO NOTHING;
