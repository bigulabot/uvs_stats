const CACHE_NAME = 'uvs-stats-cache-v1.1'; // Increment version to force update
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './scripts/app.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network-first for HTML/CSS/JS, fallback to cache
  if (event.request.method === 'GET' &&
      (event.request.destination === 'document' ||
       event.request.destination === 'script' ||
       event.request.destination === 'style')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with latest
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Default: cache-first
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});

let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
      });
      console.log('Screen Wake Lock acquired');
    }
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// Re-acquire wake lock on visibility change (e.g., after tab switch)
document.addEventListener('visibilitychange', () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

// Request wake lock on page load
window.addEventListener('load', requestWakeLock);
