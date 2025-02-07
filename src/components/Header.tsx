import React from 'react';
import { Newspaper, Search, RefreshCw, Calendar, Sun, Moon, Bookmark, GroupIcon } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useTheme } from '../context/ThemeContext';
import { fetchArticles } from '../services/newsService';

export default function Header() {
  const { state, dispatch } = useNews();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [startDate, setStartDate] = React.useState(state.filters.dateRange?.startDate || thirtyDaysAgo);
  const [endDate, setEndDate] = React.useState(state.filters.dateRange?.endDate || today);
  const [groupBy, setGroupBy] = React.useState(state.filters.groupBy);
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Initialize local state from global state
  React.useEffect(() => {
    setSearchQuery(state.filters.searchQuery);
    setStartDate(state.filters.dateRange?.startDate || thirtyDaysAgo);
    setEndDate(state.filters.dateRange?.endDate || today);
    setGroupBy(state.filters.groupBy);
  }, [state.filters.searchQuery, state.filters.dateRange, state.filters.groupBy, thirtyDaysAgo, today]);

  const handleRefresh = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    dispatch({ type: 'SET_FILTERS', payload: { searchQuery: e.target.value } });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        dateRange: {
          startDate: newStartDate,
          endDate: endDate,
        },
      },
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        dateRange: {
          startDate: startDate,
          endDate: newEndDate,
        },
      },
    });
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroupBy = e.target.value as 'date' | 'category' | 'region';
    setGroupBy(newGroupBy);
    dispatch({
      type: 'SET_FILTERS',
      payload: { groupBy: newGroupBy },
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Newspaper className="h-8 w-8 text-black" />
            <h1 className="ml-2 text-xl font-bold font-montserrat text-black">Product Tapas News</h1>
          </div>
          
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative flex gap-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-black" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="input-primary pl-10"
              />
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-black" />
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={handleStartDateChange}
                  className="input-primary w-32"
                />
                <span className="text-black font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={handleEndDateChange}
                  className="input-primary w-32"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GroupIcon className="h-5 w-5 text-black" />
              <select
                value={groupBy}
                onChange={handleGroupByChange}
                className="input-primary w-32 text-sm py-1"
              >
                <option value="date">By Date</option>
                <option value="category">By Category</option>
                <option value="region">By Region</option>
              </select>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_FILTERS', payload: { showSaved: !state.filters.showSaved } })}
              className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tapas-primary ${
                state.filters.showSaved
                  ? 'text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
              aria-label="Toggle saved articles"
            >
              <Bookmark className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tapas-primary rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleRefresh}
              className="btn-primary inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}