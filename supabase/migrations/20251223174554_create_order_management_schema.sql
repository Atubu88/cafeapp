/*
  # Create order management schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Category name

    - `products`
      - `id` (uuid, primary key) - Unique identifier
      - `category_id` (uuid, foreign key) - Reference to category
      - `name` (text) - Product name
      - `price` (integer) - Price in cents

    - `orders`
      - `id` (uuid, primary key) - Unique identifier
      - `total_price` (integer) - Total order price in cents
      - `created_at` (timestamptz) - Order creation timestamp

    - `order_items`
      - `id` (uuid, primary key) - Unique identifier
      - `order_id` (uuid, foreign key) - Reference to order
      - `product_id` (uuid, foreign key) - Reference to product
      - `quantity` (integer) - Quantity ordered
      - `price` (integer) - Price per unit at time of order

  2. Security
    - Enable RLS on all tables
    - Allow anonymous SELECT on categories and products
    - Allow anonymous INSERT on orders and order_items
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  price integer NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_price integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  price integer NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read products"
  ON products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);
