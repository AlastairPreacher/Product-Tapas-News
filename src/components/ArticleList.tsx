import React from 'react';
import { ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { Article } from '../types';
import { markArticleAsRead } from '../services/newsService';
import { useInView } from 'react-intersection-observer';
import { useVirtualizer } from '../hooks/useVirtualizer';
import { debugLog } from '../utils/debug';

const ARTICLES_PER_PAGE = 5;
const OVERSCAN_COUNT = 2;

function ArticleSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
        <div className="h-5 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px 0px',
  });

  const { dispatch } = useNews();

  const handleArticleClick = () => {
    markArticleAsRead(article.id);
    dispatch({ type: 'MARK_ARTICLE_READ', payload: article.id });
  };

  const handleSaveArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_SAVE_ARTICLE', payload: article.id });
  };

  return (
    <div
      ref={ref}
      className={`card overflow-hidden ${
        !inView ? 'opacity-0' : 'opacity-100'
      } ${
      article.isRead ? 'opacity-75' : ''
    }`}>
      <div className="text-black dark:text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex h-2 w-2 rounded-full ${
                article.isRead ? 'bg-gray-300' : 'bg-tapas-primary'
              }`} />
              <span className="tag">
                {article.category}
              </span>
              <div className="flex gap-1">
                {article.regions?.map((region) => (
                  <span
                    key={region}
                    className="tag"
                  >
                    {region}
                  </span>
                )) || (
                  <span className="tag">
                    Global
                  </span>
                )}
              </div>
            </div>
            <h3 className="mt-2 text-lg font-montserrat font-semibold text-tapas-primary">{article.title}</h3>
            <p className="mt-2 text-sm text-black dark:text-white">{article.summary}</p>
            {article.relevance && (
              <p className="mt-2 text-sm text-tapas-primary font-medium">{article.relevance}</p>
            )}
          </div>
          <a
            href={article.url}
            target="_blank"
            onClick={handleArticleClick}
            rel="noopener noreferrer"
            className="ml-4 flex-shrink-0 text-tapas-primary hover:text-[#DFA060] transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <button
            onClick={handleSaveArticle}
            className={`ml-2 p-1 rounded-full hover:bg-tapas-card/50 ${
              article.isSaved
                ? 'text-tapas-primary'
                : 'text-gray-400 hover:text-tapas-primary'
            }`}
          >
            {article.isSaved ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-black/60 dark:text-white/60">
          <span>{article.source}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

function ArticleGroup({ title, articles }: { title: string; articles: Article[] }) {
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(ARTICLES_PER_PAGE);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '400px 0px', // Increased for better preloading
  });

  const virtualizer = useVirtualizer({
    count: Math.min(visibleCount, articles.length),
    getScrollElement: () => containerRef.current,
    estimateSize: () => 200, // Estimated height of each article
    overscan: OVERSCAN_COUNT,
  });

  const loadMoreArticles = React.useCallback(() => {
    if (!isLoadingMore && visibleCount < articles.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + ARTICLES_PER_PAGE, articles.length));
        setIsLoadingMore(false);
      }, 150);
    }
  }, [articles.length, isLoadingMore, visibleCount]);

  React.useEffect(() => {
    if (inView && !isLoadingMore) {
      loadMoreArticles();
    }
  }, [inView, loadMoreArticles, isLoadingMore]);

  // Reset visible count when articles change
  React.useEffect(() => {
    setVisibleCount(ARTICLES_PER_PAGE);
  }, [articles]);

  return (
    <div className="mb-8" ref={containerRef}>
      <h2 className="text-lg font-montserrat font-bold text-tapas-primary mb-4">{title}</h2>
      <div 
        className="relative"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            className="absolute top-0 left-0 w-full"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {virtualRow.index < articles.length ? (
              <ArticleCard article={articles[virtualRow.index]} />
            ) : (
              <ArticleSkeleton />
            )}
          </div>
        ))}
        {visibleCount < articles.length && (
          <div ref={ref} className="h-10" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

export default function ArticleList() {
  const { state } = useNews();
  const { articles, filters, isLoading, error } = state;

  const savedArticles = articles.filter(article => article.isSaved);
  const articlesToShow = filters.showSaved ? savedArticles : articles;

  const filteredArticles = React.useMemo(() => {
    debugLog('ArticleList', 'Filtering articles', {
      totalArticles: articles.length,
      filters: {
        categories: filters.categories,
        regions: filters.regions,
        searchQuery: filters.searchQuery,
        dateRange: filters.dateRange,
        showSaved: filters.showSaved
      }
    });

    return articles.filter((article) => {
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(article.category);
      const matchesRegion = filters.regions.length === 0 || 
        article.regions.some(region => filters.regions.includes(region));
      const matchesDateRange = !filters.dateRange || (
        new Date(article.publishedAt) >= new Date(filters.dateRange.startDate) &&
        new Date(article.publishedAt) <= new Date(filters.dateRange.endDate + 'T23:59:59.999Z')
      );
      const matchesSearch =
        !filters.searchQuery ||
        article.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesSaved = !filters.showSaved || article.isSaved;

      const matches = matchesCategory && matchesRegion && matchesSearch && 
        matchesDateRange && matchesSaved;

      debugLog('ArticleList', `Article ${article.id} matches:`, {
        category: matchesCategory,
        region: matchesRegion,
        dateRange: matchesDateRange,
        search: matchesSearch,
        saved: matchesSaved,
        overall: matches
      });

      return matches;
    });
  }, [articles, filters]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="mb-8">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, articleIndex) => (
                <ArticleSkeleton key={articleIndex} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
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

  if (filteredArticles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <p>
          {filters.showSaved
            ? "You haven't saved any articles yet."
            : "No articles found matching your criteria."}
        </p>
      </div>
    );
  }

  // Group articles based on the selected grouping
  const groupedArticles = filteredArticles.reduce<Record<string, Article[]>>((groups, article) => {
    let groupKey = '';
    
    switch (filters.groupBy) {
      case 'date': {
        const date = new Date(article.publishedAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
          groupKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          groupKey = 'Yesterday';
        } else {
          groupKey = date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
        break;
      }
      case 'category':
        groupKey = article.category;
        break;
      case 'region':
        // Create a group for each unique region
        article.regions.forEach(region => {
          if (!groups[region]) {
            groups[region] = [];
          }
          groups[region].push(article);
        });
        return groups;
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(article);
    return groups;
  }, {});

  // Sort groups based on grouping type
  const sortedGroups = Object.entries(groupedArticles).sort(([keyA, articlesA], [keyB, articlesB]) => {
    switch (filters.groupBy) {
      case 'date':
        // Special handling for "Today" and "Yesterday"
        if (keyA === 'Today') return -1;
        if (keyB === 'Today') return 1;
        if (keyA === 'Yesterday') return -1;
        if (keyB === 'Yesterday') return 1;
        // For other dates, compare them normally
        return new Date(articlesB[0].publishedAt).getTime() - new Date(articlesA[0].publishedAt).getTime();
      case 'category':
        return keyA.localeCompare(keyB);
      case 'region':
        return keyA.localeCompare(keyB);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      {sortedGroups.map(([groupTitle, groupArticles]) => (
        <ArticleGroup
          key={groupTitle}
          title={groupTitle}
          articles={groupArticles}
        />
      ))}
    </div>
  );
}