-- Tunisian food database expansion
-- Run after 005_create_foods.sql and 006_seed_foods.sql

INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES

-- Pasta & Grains
('Makrouna Tounseya', 140, 5, 24, 3, 100, 'g', 'Tunisian'),
('Couscous plain cooked', 112, 3.8, 23, 0.6, 100, 'g', 'Tunisian'),
('Couscous avec legumes', 130, 4, 26, 2, 100, 'g', 'Tunisian'),
('Nwasser', 120, 4, 22, 1.5, 100, 'g', 'Tunisian'),
('Dwida dry', 350, 12, 70, 2, 100, 'g', 'Tunisian'),
('Riz blanc cuit', 130, 2.7, 28, 0.3, 100, 'g', 'Tunisian'),
('Khobz Mtabga', 250, 8, 48, 3, 100, 'g', 'Tunisian'),
('Baguette', 280, 9, 55, 1.5, 100, 'g', 'Tunisian'),
('Pain libanais', 265, 8, 52, 1.5, 100, 'g', 'Tunisian'),

-- Legumes & Stews
('Loubya', 110, 7, 18, 1.5, 100, 'g', 'Tunisian'),
('Lablabi', 120, 6, 20, 2, 100, 'g', 'Tunisian'),
('Chorba frik', 95, 6, 14, 1.5, 100, 'g', 'Tunisian'),
('Harissa', 45, 2, 8, 1, 100, 'g', 'Tunisian'),
('Ojja', 140, 8, 10, 8, 100, 'g', 'Tunisian'),
('Mloukhia', 180, 10, 8, 12, 100, 'g', 'Tunisian'),
('Marqa boeuf', 160, 14, 8, 8, 100, 'g', 'Tunisian'),

-- Street Food
('Fricasse', 310, 10, 38, 14, 1, 'piece', 'Tunisian'),
('Brik a l oeuf', 180, 8, 18, 9, 1, 'piece', 'Tunisian'),
('Kafteji', 200, 6, 22, 10, 100, 'g', 'Tunisian'),
('Merguez grillee', 280, 16, 2, 24, 100, 'g', 'Tunisian'),
('Sandwich shawarma poulet', 350, 22, 35, 12, 1, 'piece', 'Tunisian'),
('Sandwich thon', 300, 18, 32, 10, 1, 'piece', 'Tunisian'),

-- Proteins
('Poulet grille', 165, 31, 0, 3.6, 100, 'g', 'Tunisian'),
('Poulet roti', 190, 27, 0, 9, 100, 'g', 'Tunisian'),
('Thon en conserve', 130, 26, 0, 3, 100, 'g', 'Tunisian'),
('Oeuf', 155, 13, 1.1, 11, 100, 'g', 'Tunisian'),
('Sardine grillee', 185, 22, 0, 11, 100, 'g', 'Tunisian'),
('Kefta boeuf', 250, 20, 4, 18, 100, 'g', 'Tunisian'),

-- Dairy & Breakfast
('Lben', 55, 3.5, 5, 2, 100, 'ml', 'Tunisian'),
('Fromage kiri', 60, 3, 2, 5, 1, 'piece', 'Tunisian'),
('Yaourt nature', 65, 4, 5, 2.5, 100, 'g', 'Tunisian'),
('Calypso Yoplait', 90, 3, 14, 2.5, 1, 'unit', 'Tunisian'),

-- Fruits
('Pasteque', 30, 0.6, 8, 0.2, 100, 'g', 'Tunisian'),
('Melon', 34, 0.8, 8, 0.2, 100, 'g', 'Tunisian'),
('Fraises', 32, 0.7, 8, 0.3, 100, 'g', 'Tunisian'),
('Dattes', 282, 2.5, 75, 0.4, 100, 'g', 'Tunisian'),
('Figue', 74, 0.8, 19, 0.3, 100, 'g', 'Tunisian'),
('Orange', 47, 0.9, 12, 0.1, 100, 'g', 'Tunisian'),

-- Ramadan
('Zlabia', 450, 4, 72, 18, 100, 'g', 'Tunisian'),
('Asida', 180, 3, 38, 2, 100, 'g', 'Tunisian'),
('Bambalouni', 390, 6, 58, 16, 100, 'g', 'Tunisian'),
('Hrira', 110, 5, 18, 2, 100, 'g', 'Tunisian'),
('Bsissa', 400, 12, 60, 14, 100, 'g', 'Tunisian')

ON CONFLICT DO NOTHING;
