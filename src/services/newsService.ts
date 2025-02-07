import { Article, Category, Region } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { debugLog, debugError } from '../utils/debug';

const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 50;

export async function fetchArticles(): Promise<Article[]> {
  try {
    debugLog('NewsService', 'Fetching articles...');
    
    // Try to get cached articles first
    const cachedArticles = localStorage.getItem('cachedArticles');
    const cachedTimestamp = localStorage.getItem('articlesLastFetched');
    const savedArticles = new Set(JSON.parse(localStorage.getItem('savedArticles') || '[]'));
    const readArticles = new Set(JSON.parse(localStorage.getItem('readArticles') || '[]'));

    if (cachedArticles && cachedTimestamp) {
      const lastFetched = new Date(cachedTimestamp);
      const now = new Date();
      
      if (now.getTime() - lastFetched.getTime() < CACHE_DURATION) {
        debugLog('NewsService', 'Using cached articles');
        return JSON.parse(cachedArticles).map((article: Article) => ({
          ...article,
          isRead: readArticles.has(article.id),
          isSaved: savedArticles.has(article.id),
        }));
      }
    }

    // Fetch fresh data from Supabase
    const supabase = await getSupabaseClient();
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(BATCH_SIZE);

    if (error) {
      throw error;
    }

    if (!articles) {
      debugLog('NewsService', 'No articles found');
      return [];
    }

    const processedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      url: article.url,
      summary: article.summary,
      publishedAt: article.published_at,
      source: article.source,
      category: article.category as Category,
      regions: article.regions as Region[],
      relevance: article.relevance || undefined,
      isRead: readArticles.has(article.id),
      isSaved: savedArticles.has(article.id),
      lastFetched: article.last_fetched
    }));

    // Update cache
    localStorage.setItem('cachedArticles', JSON.stringify(processedArticles));
    localStorage.setItem('articlesLastFetched', new Date().toISOString());
    
    debugLog('NewsService', `Fetched ${processedArticles.length} articles`);
    return processedArticles;
  } catch (error) {
    debugError('NewsService', 'Failed to fetch articles:', error);
    throw error;
  }
}

export function markArticleAsRead(articleId: string) {
  const readArticles = new Set(JSON.parse(localStorage.getItem('readArticles') || '[]'));
  readArticles.add(articleId);
  localStorage.setItem('readArticles', JSON.stringify(Array.from(readArticles)));
}

export function startArticlePolling(callback: () => void) {
  debugLog('NewsService', 'Starting article polling');
  const interval = setInterval(callback, POLL_INTERVAL);
  return () => clearInterval(interval);
}