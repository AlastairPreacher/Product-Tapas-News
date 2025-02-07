export type Category = 
  | 'AI'
  | 'Startups'
  | 'Business'
  | 'Technology'
  | 'Product Management'
  | 'Innovation'
  | 'Funding';

export type Region = 
  // APAC
  | 'Australia'
  | 'New Zealand'
  | 'Southeast Asia'
  | 'East Asia'
  | 'South Asia'
  // Europe
  | 'UK'
  | 'Western Europe'
  | 'Northern Europe'
  | 'Southern Europe'
  | 'Eastern Europe'
  // Americas
  | 'US'
  | 'Canada'
  | 'Latin America'
  // Other Regions
  | 'Middle East'
  | 'Africa'
  | 'Global';

export type RegionGroup =
  | 'APAC'
  | 'Europe'
  | 'Americas'
  | 'Other'
  | 'Global';

export interface Article {
  id: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  source: string;
  category: Category;
  regions: Region[];
  relevance?: string;
  isRead?: boolean;
  lastFetched?: string;
}

export interface NewsFilters {
  categories: Category[];
  regions: Region[];
  searchQuery: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  groupBy: 'date' | 'category' | 'region';
  showSaved?: boolean;
}