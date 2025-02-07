/*
  # Add test articles

  1. Changes
    - Add initial test articles to verify frontend functionality
    
  2. Test Data
    - Articles from different categories
    - Articles from different regions
    - Articles with different dates
*/

INSERT INTO articles (
  id,
  title,
  url,
  summary,
  published_at,
  source,
  category,
  regions,
  relevance,
  created_at,
  last_fetched
) VALUES
(
  'test-article-1',
  'OpenAI Announces GPT-5 Development',
  'https://example.com/gpt5',
  'OpenAI has begun development on GPT-5, promising significant improvements in reasoning and multimodal capabilities.',
  NOW() - INTERVAL '1 day',
  'TechCrunch',
  'AI',
  ARRAY['Global'],
  'Breaking News',
  NOW(),
  NOW()
),
(
  'test-article-2',
  'Southeast Asian Startup Raises $50M Series B',
  'https://example.com/startup-funding',
  'A promising startup in Singapore has secured $50M in Series B funding to expand its fintech platform across Southeast Asia.',
  NOW() - INTERVAL '2 days',
  'Tech in Asia',
  'Funding',
  ARRAY['Southeast Asia'],
  'Industry Trends',
  NOW(),
  NOW()
),
(
  'test-article-3',
  'Product Management Trends 2025',
  'https://example.com/pm-trends',
  'New study reveals emerging product management methodologies and tools that will shape the industry in 2025.',
  NOW() - INTERVAL '3 days',
  'ProductHunt',
  'Product Management',
  ARRAY['Global'],
  'In-depth Analysis',
  NOW(),
  NOW()
);