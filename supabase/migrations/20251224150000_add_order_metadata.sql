/*
  # Add metadata fields to orders

  1. Changes
    - Add `status` column to orders
    - Add `source` column to orders
    - Add `tg_user_id` column to orders
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS tg_user_id text;
