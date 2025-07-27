// service-worker.js

// Generate a unique cache name based on the current timestamp.
const LIVE_CACHE = 'faritany-v2';
const TEMP_CACHE = 'faritant-temp-v2';

const ASSETS = [
  '/',
  '/index.html',
  '/styles.js',
  '/manifest.json',
  '/icon-512.png',
  '/icon-192.png',
  '/favicon.ico'
];

/ Install: Download all assets into a temporary cache.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(TEMP_CACHE).then(tempCache => {
      return Promise.all(
        ASSETS.map(url => {
          return fetch(url).then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }
            console.log(`Service Worker: Cached ${url}`);
            return tempCache.put(url, response.clone());
          }).catch(error => {
            console.error(`Service Worker: Failed to cache ${url}:`, error);
            // Continue with other assets even if one fails
            return null;
          });
        })
      );
    })
  );
});

// Activate: Replace live cache ONLY if ALL assets are staged
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    (async () => {
      const tempCache = await caches.open(TEMP_CACHE);
      const cachedRequests = await tempCache.keys();
      
      // ✅ ALL ASSETS ARE CRITICAL - Strict verification
      if (cachedRequests.length === ASSETS.length) {
        console.log('Service Worker: ALL assets staged successfully, updating live cache');
        
        // Complete atomic replacement
        await caches.delete(LIVE_CACHE);
        const liveCache = await caches.open(LIVE_CACHE);
        
        // Copy ALL assets from temp cache to live cache
        for (const request of cachedRequests) {
          const response = await tempCache.match(request);
          await liveCache.put(request, response);
        }
        
        // Clean temp cache
        await caches.delete(TEMP_CACHE);
        
        // Notify clients that new version is ready
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({ action: 'reload', message: 'App updated - all assets ready' });
        });
        
        console.log('Service Worker: Cache replacement completed successfully');
      } else {
        // ❌ FAILURE: Not all assets → Keep old version
        console.error(`Service Worker: Incomplete staging - expected ${ASSETS.length}, got ${cachedRequests.length}. Keeping old cache.`);
        await caches.delete(TEMP_CACHE);
      }
      
      await self.clients.claim();
    })()
  );
});

// 🚀 ROBUST STRATEGY: CACHE FIRST WITH INTELLIGENT FALLBACK
self.addEventListener('fetch', event => {
  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  try {
    // 1️⃣ ALWAYS TRY CACHE FIRST
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log(`Service Worker: Serving from cache: ${request.url}`);
      
      // 2️⃣ CACHE HIT: Update in background if possible
      updateCacheInBackground(request);
      
      return cachedResponse;
    }
    
    // 3️⃣ CACHE MISS: Try network
    console.log(`Service Worker: Cache miss, trying network: ${request.url}`);
    return await fetchFromNetworkWithFallback(request);
    
  } catch (error) {
    console.error('Service Worker: Fetch error:', error);
    return createErrorResponse(request);
  }
}

async function fetchFromNetworkWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // ✅ CRITICAL CHECK: Server error?
    if (!networkResponse.ok) {
      console.warn(`Service Worker: Server error ${networkResponse.status} for ${request.url}`);
      
      // Try to serve from cache even if not exact match
      const fallbackResponse = await findFallbackInCache(request);
      if (fallbackResponse) {
        console.log('Service Worker: Using fallback from cache due to server error');
        return fallbackResponse;
      }
      
      // If no fallback, return server error
      return networkResponse;
    }
    
    // ✅ NETWORK RESPONSE OK: Cache it
    console.log(`Service Worker: Network success for ${request.url}`);
    const cache = await caches.open(LIVE_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
    
  } catch (networkError) {
    console.error('Service Worker: Network completely failed:', networkError);
    
    // Network completely down: look for fallback
    const fallbackResponse = await findFallbackInCache(request);
    if (fallbackResponse) {
      console.log('Service Worker: Using fallback due to network failure');
      return fallbackResponse;
    }
    
    return createErrorResponse(request);
  }
}

async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(LIVE_CACHE);
      await cache.put(request, networkResponse.clone());
      console.log(`Service Worker: Background update successful for ${request.url}`);
    }
  } catch (error) {
    console.log(`Service Worker: Background update failed for ${request.url}:`, error);
    // Silent failure in background
  }
}

async function findFallbackInCache(request) {
  const cache = await caches.open(LIVE_CACHE);
  
  // Fallback strategies in priority order
  const fallbackStrategies = [
    // 1. Exact match (already tested but retry)
    request.url,
    
    // 2. If HTML page, serve index.html (SPA)
    request.destination === 'document' ? '/' : null,
    request.destination === 'document' ? '/index.html' : null,
    
    // 3. If asset, try without query string
    request.url.split('?')[0],
    
    // 4. For root requests
    request.url.endsWith('/') ? '/index.html' : null
  ].filter(Boolean);
  
  for (const fallbackUrl of fallbackStrategies) {
    const fallbackResponse = await cache.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
  }
  
  return null;
}

function createErrorResponse(request) {
  // Minimal error page for universal apps
  const isHtmlRequest = request.destination === 'document' || 
                       request.headers.get('accept')?.includes('text/html');
  
  if (isHtmlRequest) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Application temporarily unavailable</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5; 
          }
          .error-container { 
            background: white; 
            padding: 40px; 
            border-radius: 10px; 
            max-width: 500px; 
            margin: 0 auto; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
          }
          .retry-btn { 
            background: #007cba; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h2>⚠️ Service temporarily unavailable</h2>
          <p>The application cannot connect to the server right now.</p>
          <p>This app is designed to work offline once loaded.</p>
          <button class="retry-btn" onclick="window.location.reload()">
            🔄 Retry
          </button>
        </div>
        <script>
          // Automatic reconnection attempt every 30 seconds
          setTimeout(() => {
            if (navigator.onLine) {
              window.location.reload();
            }
          }, 30000);
        </script>
      </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Temporarily Unavailable',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } else {
    // For non-HTML assets
    return new Response('Service temporarily unavailable', {
      status: 503,
      statusText: 'Service Temporarily Unavailable',
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// 📊 DEBUG EVENTS (optional)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_INFO') {
    getCacheInfo().then(info => {
      event.ports[0].postMessage(info);
    });
  }
});

async function getCacheInfo() {
  const cache = await caches.open(LIVE_CACHE);
  const keys = await cache.keys();
  return {
    cacheSize: keys.length,
    cachedUrls: keys.map(req => req.url)
  };
}
