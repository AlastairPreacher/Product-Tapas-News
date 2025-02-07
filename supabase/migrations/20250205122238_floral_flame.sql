/*
  # Create user_articles table for tracking read and saved states

  1. New Tables
    - `user_articles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, not null) - References auth.users
      - `article_id` (text, not null) - References articles
      - `is_read` (boolean, default false)
      - `is_saved` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on user_articles table
    - Add policies for authenticated users to manage their own records
*/

-- Create user_articles table
CREATE TABLE IF NOT EXISTS user_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  article_id text NOT NULL REFERENCES articles,
  is_read boolean DEFAULT false,
  is_saved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Enable RLS
ALTER TABLE user_articles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own records
CREATE POLICY "Users can read own records"
  ON user_articles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own records
CREATE POLICY "Users can insert own records"
  ON user_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own records
CREATE POLICY "Users can update own records"
  ON user_articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);