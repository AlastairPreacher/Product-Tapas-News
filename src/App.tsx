import React from 'react';
import { NewsProvider } from './context/NewsContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import { useEffect } from 'react';

export default function App() {
  const [error, setError] = React.useState<string | null>(null);
  const [renderAttempt, setRenderAttempt] = React.useState(0);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(`An error occurred: ${event.error?.message || 'Unknown error'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(`Promise error: ${event.reason?.message || 'Unknown promise error'}`);
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  useEffect(() => {
    console.log('App rendering attempt:', renderAttempt);
    setRenderAttempt(prev => prev + 1);
    setIsInitialized(true);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#476c77] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
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

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#476c77] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-tapas-primary mb-4">Initializing...</h1>
          <p className="text-gray-700">Please wait while the application loads.</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <NewsProvider>
        <div className="min-h-screen bg-[#476c77] transition-colors relative">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
            <div className="fixed top-[4.5rem] bottom-0 z-40 overflow-y-auto thin-scrollbar">
              <Sidebar />
            </div>
            <main className="flex-1 ml-[14rem] py-8 overflow-y-auto min-h-[calc(100vh-4.5rem)]">
                <ArticleList />
            </main>
          </div>
          {/* Debug overlay */}
          <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
            <p>Render attempt: {renderAttempt}</p>
            <p>Theme: {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-3 py-1 bg-tapas-primary text-black rounded">
              Force Reload
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && <div id="debug-root"></div>}
        </div>
      </NewsProvider>
    </ThemeProvider>
  );
}