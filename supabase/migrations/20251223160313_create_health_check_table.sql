/*
  # Create health check table for database connection testing

  1. New Tables
    - `health_check`
      - `id` (uuid, primary key) - Unique identifier
      - `status` (text) - Status message
      - `created_at` (timestamptz) - Timestamp of health check

  2. Purpose
    - Simple table to verify database connection is working
    - Used for testing basic database operations
    - No authentication required for this minimal setup

  3. Security
    - Enable RLS on `health_check` table
    - Add policy to allow anonymous read access for health checks
*/

CREATE TABLE IF NOT EXISTS health_check (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'ok',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read for health checks"
  ON health_check
  FOR SELECT
  TO anon
  USING (true);

INSERT INTO health_check (status) VALUES ('Database connected successfully');
