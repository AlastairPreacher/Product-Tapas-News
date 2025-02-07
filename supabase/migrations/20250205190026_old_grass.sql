/*
  # Update articles table schema
  
  1. Changes
    - Add constraint to ensure valid categories
  
  2. Security
    - No changes to existing RLS policies
*/

-- Add category constraint to articles table
ALTER TABLE articles 
ADD CONSTRAINT valid_category CHECK (
  category IN ('AI', 'Startups', 'Business', 'Technology', 'Product Management', 'Innovation', 'Funding')
);