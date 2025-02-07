import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createDebugOverlay, debugLog, debugError } from './utils/debug.ts';
import './index.css';

debugLog('Main', 'Application initialization started');

// Initialize debug tools
if (process.env.NODE_ENV === 'development') {
  debugLog('Main', 'Setting up debug tools');
  createDebugOverlay();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  debugError('Main', 'Root element not found');
  throw new Error('Failed to find root element');
}

debugLog('Main', 'Creating React root');
const root = createRoot(rootElement);

function renderApp() {
  try {
    debugLog('Main', 'Starting initial render');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    debugLog('Main', 'Initial render complete');
  } catch (error) {
    debugError('Main', 'Fatal render error', error);
    rootElement.innerHTML = `
      <div class="min-h-screen bg-[#476c77] flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 class="text-xl font-bold text-red-600 mb-4">Critical Error</h1>
          <p class="text-gray-700">Failed to initialize the application</p>
          <pre class="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
            ${error instanceof Error ? error.stack : String(error)}
          </pre>
          <button
            onclick="window.location.reload()"
            class="mt-4 bg-[#EFB071] text-black font-semibold px-4 py-2 rounded-lg shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    `;
  }
}

renderApp();