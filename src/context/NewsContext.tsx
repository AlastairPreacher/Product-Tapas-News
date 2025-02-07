import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Article, NewsFilters } from '../types';
import { fetchArticles, startArticlePolling } from '../services/newsService';
import { debugLog, debugError } from '../utils/debug';

interface NewsState {
  articles: Article[];
  filters: NewsFilters;
  isLoading: boolean;
  error: string | null;
}

type NewsAction =
  | { type: 'SET_ARTICLES'; payload: Article[] }
  | { type: 'MARK_ARTICLE_READ'; payload: string }
  | { type: 'TOGGLE_SAVE_ARTICLE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<NewsFilters> };

const initialState: NewsState = {
  articles: [],
  filters: {
    categories: [],
    regions: [],
    searchQuery: '',
    groupBy: 'date',
    showSaved: false,
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
  isLoading: false,
  error: null,
};

const NewsContext = createContext<{
  state: NewsState;
  dispatch: React.Dispatch<NewsAction>;
} | null>(null);

function newsReducer(state: NewsState, action: NewsAction): NewsState {
  debugLog('NewsContext', `Reducing action: ${action.type}`);
  switch (action.type) {
    case 'SET_ARTICLES':
      return { 
        ...state, 
        articles: action.payload, 
        isLoading: false,
        error: null 
      };
    case 'MARK_ARTICLE_READ':
      return {
        ...state,
        articles: state.articles.map(article =>
          article.id === action.payload
            ? { ...article, isRead: true }
            : article
        ),
      };
    case 'TOGGLE_SAVE_ARTICLE':
      const savedArticles = new Set(JSON.parse(localStorage.getItem('savedArticles') || '[]'));
      if (savedArticles.has(action.payload)) {
        savedArticles.delete(action.payload);
      } else {
        savedArticles.add(action.payload);
      }
      localStorage.setItem('savedArticles', JSON.stringify(Array.from(savedArticles)));
      return {
        ...state,
        articles: state.articles.map(article =>
          article.id === action.payload
            ? { ...article, isSaved: !article.isSaved }
            : article
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        isLoading: false 
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        isLoading: true
      };
    default:
      return state;
  }
}

export function NewsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(newsReducer, initialState);
  const [initError, setInitError] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const initAttemptRef = React.useRef(0);
  const mountedRef = React.useRef(false);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Initial fetch
  useEffect(() => {
    if (mountedRef.current) {
      debugLog('NewsContext', 'Preventing duplicate initialization');
      return;
    }
    mountedRef.current = true;
    
    const loadArticles = async () => {
      initAttemptRef.current += 1;
      debugLog('NewsContext', `Initialization attempt ${initAttemptRef.current}`);
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const articles = await fetchArticles();
        debugLog('NewsContext', 'Initial articles fetch result:', {
          count: articles.length,
          firstArticle: articles[0],
          lastArticle: articles[articles.length - 1]
        });
        dispatch({ type: 'SET_ARTICLES', payload: articles });
        setIsInitialized(true);
      } catch (error) {
        debugError('NewsContext', 'Failed to fetch articles');
        setInitError(error instanceof Error ? error.message : String(error));
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load articles' });
        
        // Retry initialization if we haven't tried too many times
        if (initAttemptRef.current < 3) {
          debugLog('NewsContext', `Scheduling retry... (attempt ${initAttemptRef.current})`);
          fetchTimeoutRef.current = setTimeout(loadArticles, 2000);
        }
      }
    };

    loadArticles();
    
    return () => {
      mountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#476c77] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-tapas-primary mb-4">Loading News...</h1>
          <p className="text-gray-700">Please wait while we fetch the latest articles.</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-[#476c77] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="text-gray-700">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <NewsContext.Provider value={{ state, dispatch }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}