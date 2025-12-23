/*
  # Seed initial data

  1. Insert Categories
    - Beverages
    - Snacks

  2. Insert Products
    - Beverages: Coffee (300), Tea (200)
    - Snacks: Croissant (400), Sandwich (600)
*/

INSERT INTO categories (name) VALUES
  ('Beverages'),
  ('Snacks')
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, price) VALUES
  ((SELECT id FROM categories WHERE name = 'Beverages'), 'Coffee', 300),
  ((SELECT id FROM categories WHERE name = 'Beverages'), 'Tea', 200),
  ((SELECT id FROM categories WHERE name = 'Snacks'), 'Croissant', 400),
  ((SELECT id FROM categories WHERE name = 'Snacks'), 'Sandwich', 600)
ON CONFLICT DO NOTHING;
