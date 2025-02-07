import { serve } from 'https://deno.fresh.dev/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { Article, Category, Region } from '../../../src/types/index.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RSS_SOURCES = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    regions: ['Global'] as Region[],
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    regions: ['Global'] as Region[],
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed',
    regions: ['Global'] as Region[],
  }
];

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  } finally {
    clearTimeout(id);
  }
}

function determineCategory(title: string, content: string): Category {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
    return 'AI';
  }
  if (text.includes('startup') || text.includes('founder')) {
    return 'Startups';
  }
  if (text.includes('funding') || text.includes('raised') || text.includes('investment')) {
    return 'Funding';
  }
  if (text.includes('product') || text.includes('feature') || text.includes('launch')) {
    return 'Product Management';
  }
  if (text.includes('innovation') || text.includes('breakthrough') || text.includes('research')) {
    return 'Innovation';
  }
  if (text.includes('business') || text.includes('company') || text.includes('market')) {
    return 'Business';
  }
  
  return 'Technology';
}

async function fetchRSSFeed(source: typeof RSS_SOURCES[0]): Promise<Article[]> {
  try {
    console.log(`[${source.name}] Fetching RSS feed...`);
    
    const response = await fetchWithTimeout(source.url);
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    if (!xml) {
      throw new Error('Failed to parse XML');
    }
    
    const items = xml.querySelectorAll('item, entry');
    console.log(`[${source.name}] Found ${items.length} items`);
    
    return Array.from(items).map((item): Article => {
      const title = item.querySelector('title')?.textContent?.trim() || 'Untitled';
      const link = item.querySelector('link')?.textContent?.trim() || 
                  item.querySelector('link')?.getAttribute('href')?.trim() || 
                  '';
      const description = item.querySelector('description, content, summary')?.textContent?.trim() || '';
      const pubDate = item.querySelector('pubDate, published, updated')?.textContent?.trim() || 
                     new Date().toISOString();
      
      return {
        id: `${source.name}-${title}-${pubDate}`.replace(/[^a-zA-Z0-9-]/g, '-'),
        title,
        url: link,
        summary: description
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 200) + (description.length > 200 ? '...' : ''),
        publishedAt: new Date(pubDate).toISOString(),
        source: source.name,
        category: determineCategory(title, description),
        regions: source.regions,
        isRead: false,
        isSaved: false,
      };
    });
  } catch (error) {
    console.error(`[${source.name}] Error:`, error);
    return [];
  }
}

async function insertArticles(articles: Article[]) {
  const { error } = await supabase.from('articles').upsert(
    articles.map(article => ({
      id: article.id,
      title: article.title,
      url: article.url,
      summary: article.summary,
      published_at: article.publishedAt,
      source: article.source,
      category: article.category,
      regions: article.regions,
      last_fetched: new Date().toISOString()
    })),
    { onConflict: 'url' }
  );

  if (error) {
    console.error('Error inserting articles:', error);
    throw error;
  }
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    console.log('Starting RSS feed fetch...');
    
    // Fetch articles from all sources
    const articlePromises = RSS_SOURCES.map(source => fetchRSSFeed(source));
    const articles = (await Promise.all(articlePromises)).flat();
    
    console.log(`Fetched ${articles.length} articles total`);
    
    if (articles.length > 0) {
      await insertArticles(articles);
      console.log('Articles inserted successfully');
    }

    // Clean up old articles
    await supabase.rpc('fn_cleanup_old_articles');
    console.log('Cleaned up old articles');

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${articles.length} articles`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});