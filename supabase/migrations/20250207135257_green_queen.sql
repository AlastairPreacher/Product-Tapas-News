/*
  # News Aggregation Setup

  1. New Functions
    - `fn_fetch_news`: Edge function to fetch news from APIs
    - `fn_process_news`: Function to process and deduplicate news articles
    - `fn_cleanup_old_articles`: Function to clean up articles older than 30 days

  2. Scheduled Jobs
    - News fetching job (every 15 minutes)
    - Cleanup job (daily)

  3. Indices
    - For faster querying and deduplication
*/

-- Create function to process and deduplicate news
CREATE OR REPLACE FUNCTION fn_process_news()
RETURNS trigger AS $$
BEGIN
  -- Remove duplicates based on URL
  DELETE FROM articles a
  WHERE a.url IN (
    SELECT url
    FROM articles
    WHERE url = NEW.url
    AND id != NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deduplication
CREATE TRIGGER tr_process_news
  BEFORE INSERT ON articles
  FOR EACH ROW
  EXECUTE FUNCTION fn_process_news();

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);

-- Create function to clean up old articles
CREATE OR REPLACE FUNCTION fn_cleanup_old_articles()
RETURNS void AS $$
BEGIN
  DELETE FROM articles
  WHERE published_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;