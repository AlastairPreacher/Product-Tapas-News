/*
  # Fix RLS policies for articles table
  
  1. Changes
    - Add policy to allow service role to insert/update articles
    - Keep existing public read access
  
  2. Security
    - Maintain public read access
    - Allow service role full access for article management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON articles;
DROP POLICY IF EXISTS "Allow service role to manage articles" ON articles;

-- Recreate policies with correct permissions
CREATE POLICY "Allow public read access"
  ON articles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to manage articles"
  ON articles
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions to service role
GRANT ALL ON articles TO service_role;