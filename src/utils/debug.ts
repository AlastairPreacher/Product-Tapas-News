export function debugLog(component: string, ...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${component}]`, ...args);
  }
}

export function debugError(component: string, error: unknown) {
  console.error(`[${component}] Error:`, error);
  if (error instanceof Error) {
    console.error('Stack:', error.stack);
  }
}

// Create a debug overlay
export function createDebugOverlay() {
  if (process.env.NODE_ENV === 'development') {
    const debugRoot = document.getElementById('debug-root');
    if (debugRoot) {
      const debugInfo = {
        lastRender: new Date().toISOString(),
        errorCount: 0,
        state: {},
      };

      const updateDebug = () => {
        debugRoot.innerHTML = `
          <div class="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
            <p>Last Render: ${new Date(debugInfo.lastRender).toLocaleTimeString()}</p>
            <p>Errors: ${debugInfo.errorCount}</p>
            <pre>${JSON.stringify(debugInfo.state, null, 2)}</pre>
          </div>
        `;
      };

      window._debug = {
        log: (msg: string) => {
          console.log('[Debug]', msg);
          debugInfo.lastRender = new Date().toISOString();
          updateDebug();
        },
        error: () => {
          debugInfo.errorCount++;
          updateDebug();
        },
        setState: (state: any) => {
          debugInfo.state = state;
          updateDebug();
        },
      };

      updateDebug();
    }
  }
}