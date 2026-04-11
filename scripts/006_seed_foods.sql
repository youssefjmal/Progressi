-- Seed curated food database with 100 common foods
INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES
  -- Grains & Bread (10)
  ('White Bread', 79, 2.7, 14, 1.1, 100, 'g', 'Grains'),
  ('Whole Wheat Bread', 69, 3.6, 12.2, 1.4, 100, 'g', 'Grains'),
  ('Brown Rice', 111, 2.6, 23, 0.9, 100, 'g', 'Grains'),
  ('White Rice', 130, 2.7, 28, 0.3, 100, 'g', 'Grains'),
  ('Oatmeal', 389, 16.9, 66, 6.9, 100, 'g', 'Grains'),
  ('Pasta', 131, 5, 25, 1.1, 100, 'g', 'Grains'),
  ('Cereal (Most)', 300, 8, 60, 2, 100, 'g', 'Grains'),
  ('Tortilla', 52, 1.5, 9, 1.3, 50, 'g', 'Grains'),
  ('Bagel', 210, 8, 41, 1.5, 90, 'g', 'Grains'),
  ('Croissant', 406, 9, 36, 21, 100, 'g', 'Grains'),

  -- Proteins - Meat (10)
  ('Chicken Breast', 165, 31, 0, 3.6, 100, 'g', 'Meat'),
  ('Ground Beef', 250, 26, 0, 15, 100, 'g', 'Meat'),
  ('Salmon', 280, 25, 0, 20, 100, 'g', 'Meat'),
  ('Tuna', 144, 29.9, 0, 1.3, 100, 'g', 'Meat'),
  ('Turkey Breast', 135, 29, 0, 1.3, 100, 'g', 'Meat'),
  ('Pork Chop', 242, 27, 0, 14, 100, 'g', 'Meat'),
  ('Beef Steak', 271, 26, 0, 18, 100, 'g', 'Meat'),
  ('Duck', 337, 24, 0, 28, 100, 'g', 'Meat'),
  ('Lamb', 294, 25, 0, 21, 100, 'g', 'Meat'),
  ('Bacon', 541, 37, 1, 43, 100, 'g', 'Meat'),

  -- Fish & Seafood (8)
  ('Shrimp', 99, 24, 0, 0.3, 100, 'g', 'Seafood'),
  ('Crab', 102, 20, 0, 1.7, 100, 'g', 'Seafood'),
  ('Oysters', 68, 7, 4, 2, 100, 'g', 'Seafood'),
  ('Mussels', 88, 12, 4, 2, 100, 'g', 'Seafood'),
  ('Cod', 82, 18, 0, 0.7, 100, 'g', 'Seafood'),
  ('Mackerel', 305, 25, 0, 23, 100, 'g', 'Seafood'),
  ('Sardines', 208, 25, 0, 11, 100, 'g', 'Seafood'),
  ('Halibut', 111, 21, 0, 2.3, 100, 'g', 'Seafood'),

  -- Eggs & Dairy (10)
  ('Egg', 155, 13, 1.1, 11, 100, 'g', 'Dairy'),
  ('Cheese (Cheddar)', 402, 25, 1.3, 33, 100, 'g', 'Dairy'),
  ('Milk (Whole)', 61, 3.2, 4.8, 3.3, 100, 'ml', 'Dairy'),
  ('Milk (Skim)', 35, 3.4, 5, 0.1, 100, 'ml', 'Dairy'),
  ('Yogurt (Plain)', 59, 10, 3, 0.4, 100, 'g', 'Dairy'),
  ('Greek Yogurt', 59, 10, 3.3, 0.4, 100, 'g', 'Dairy'),
  ('Butter', 717, 0.9, 0.1, 81, 100, 'g', 'Dairy'),
  ('Cottage Cheese', 98, 11, 4, 5, 100, 'g', 'Dairy'),
  ('Ice Cream', 207, 3.5, 24, 11, 100, 'g', 'Dairy'),
  ('Cream Cheese', 342, 5.9, 4.1, 34, 100, 'g', 'Dairy'),

  -- Vegetables (15)
  ('Broccoli', 34, 2.8, 7, 0.4, 100, 'g', 'Vegetable'),
  ('Carrot', 41, 0.9, 10, 0.2, 100, 'g', 'Vegetable'),
  ('Spinach', 23, 2.7, 3.6, 0.4, 100, 'g', 'Vegetable'),
  ('Lettuce', 15, 1.4, 2.9, 0.2, 100, 'g', 'Vegetable'),
  ('Tomato', 18, 0.9, 3.9, 0.2, 100, 'g', 'Vegetable'),
  ('Cucumber', 16, 0.7, 3.6, 0.1, 100, 'g', 'Vegetable'),
  ('Bell Pepper', 31, 1, 6, 0.3, 100, 'g', 'Vegetable'),
  ('Onion', 40, 1.1, 9, 0.1, 100, 'g', 'Vegetable'),
  ('Garlic', 149, 6.4, 33, 0.5, 100, 'g', 'Vegetable'),
  ('Potato', 77, 2, 17, 0.1, 100, 'g', 'Vegetable'),
  ('Sweet Potato', 86, 1.6, 20, 0.1, 100, 'g', 'Vegetable'),
  ('Corn', 86, 3.3, 19, 1.2, 100, 'g', 'Vegetable'),
  ('Peas', 81, 5.4, 14, 0.4, 100, 'g', 'Vegetable'),
  ('Brussels Sprouts', 43, 2.8, 8, 0.4, 100, 'g', 'Vegetable'),
  ('Asparagus', 20, 2.2, 3.7, 0.1, 100, 'g', 'Vegetable'),

  -- Fruits (12)
  ('Apple', 52, 0.3, 14, 0.2, 100, 'g', 'Fruit'),
  ('Banana', 89, 1.1, 23, 0.3, 100, 'g', 'Fruit'),
  ('Orange', 47, 0.9, 12, 0.3, 100, 'g', 'Fruit'),
  ('Strawberry', 32, 0.7, 8, 0.3, 100, 'g', 'Fruit'),
  ('Blueberry', 57, 0.7, 14, 0.3, 100, 'g', 'Fruit'),
  ('Watermelon', 30, 0.6, 8, 0.2, 100, 'g', 'Fruit'),
  ('Grape', 67, 0.7, 17, 0.2, 100, 'g', 'Fruit'),
  ('Mango', 60, 0.8, 15, 0.4, 100, 'g', 'Fruit'),
  ('Pineapple', 50, 0.5, 13, 0.1, 100, 'g', 'Fruit'),
  ('Peach', 39, 0.9, 10, 0.3, 100, 'g', 'Fruit'),
  ('Kiwi', 61, 1.1, 15, 0.5, 100, 'g', 'Fruit'),
  ('Avocado', 160, 2, 9, 15, 100, 'g', 'Fruit'),

  -- Legumes & Nuts (10)
  ('Almonds', 579, 21, 22, 50, 100, 'g', 'Nuts'),
  ('Peanut Butter', 588, 25, 20, 50, 100, 'g', 'Nuts'),
  ('Chickpeas', 119, 8.9, 20, 1.6, 100, 'g', 'Legumes'),
  ('Black Beans', 132, 8.9, 24, 0.5, 100, 'g', 'Legumes'),
  ('Lentils', 116, 9.0, 20, 0.4, 100, 'g', 'Legumes'),
  ('Peas (Dried)', 118, 8.4, 21, 0.4, 100, 'g', 'Legumes'),
  ('Peanuts', 567, 26, 16, 49, 100, 'g', 'Nuts'),
  ('Walnuts', 654, 9.1, 14, 65, 100, 'g', 'Nuts'),
  ('Cashews', 553, 18, 30, 44, 100, 'g', 'Nuts'),
  ('Sunflower Seeds', 584, 21, 20, 51, 100, 'g', 'Seeds'),

  -- Beverages & Condiments (8)
  ('Orange Juice', 45, 0.7, 11, 0.2, 100, 'ml', 'Beverage'),
  ('Apple Juice', 52, 0.1, 13, 0.1, 100, 'ml', 'Beverage'),
  ('Coffee (Black)', 2, 0.1, 0, 0, 100, 'ml', 'Beverage'),
  ('Tea (Black)', 1, 0, 0, 0, 100, 'ml', 'Beverage'),
  ('Cola', 42, 0, 11, 0, 100, 'ml', 'Beverage'),
  ('Honey', 304, 0.3, 82, 0, 100, 'g', 'Condiments'),
  ('Olive Oil', 884, 0, 0, 100, 100, 'ml', 'Condiments'),
  ('Soy Sauce', 80, 12, 7, 0, 100, 'ml', 'Condiments'),

  -- Prepared Foods (7)
  ('Pizza', 285, 12, 36, 10, 100, 'g', 'Prepared'),
  ('Hamburger', 354, 17, 24, 21, 100, 'g', 'Prepared'),
  ('Hot Dog', 290, 12, 24, 17, 100, 'g', 'Prepared'),
  ('French Fries', 365, 4, 48, 17, 100, 'g', 'Prepared'),
  ('Fried Chicken', 320, 30, 9, 17, 100, 'g', 'Prepared'),
  ('Grilled Chicken Sandwich', 280, 25, 28, 8, 100, 'g', 'Prepared'),
  ('Spaghetti with Sauce', 150, 6, 25, 3, 100, 'g', 'Prepared')
ON CONFLICT DO NOTHING;
