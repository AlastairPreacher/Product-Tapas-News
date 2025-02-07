/*
  # Create articles table and related functions

  1. New Tables
    - `articles`
      - `id` (text, primary key) - URL as unique identifier
      - `title` (text, not null)
      - `url` (text, not null)
      - `summary` (text, not null)
      - `published_at` (timestamptz, not null)
      - `source` (text, not null)
      - `category` (text, not null)
      - `regions` (text[], not null)
      - `relevance` (text)
      - `created_at` (timestamptz, default now())
      - `last_fetched` (timestamptz, default now())

  2. Security
    - Enable RLS on articles table
    - Add policies for read access
    - Add policies for service role to manage articles

  3. Functions
    - `fn_update_last_fetched()` - Updates last_fetched timestamp
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id text PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL UNIQUE,
  summary text NOT NULL,
  published_at timestamptz NOT NULL,
  source text NOT NULL,
  category text NOT NULL,
  regions text[] NOT NULL,
  relevance text,
  created_at timestamptz DEFAULT now(),
  last_fetched timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policy for reading articles (public access)
CREATE POLICY "Allow public read access"
  ON articles
  FOR SELECT
  TO public
  USING (true);

-- Create policy for service role to manage articles
CREATE POLICY "Allow service role to manage articles"
  ON articles
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update last_fetched
CREATE OR REPLACE FUNCTION fn_update_last_fetched()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_fetched = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_fetched on update
CREATE TRIGGER tr_update_last_fetched
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_last_fetched();