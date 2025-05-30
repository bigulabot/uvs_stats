const CACHE_NAME = 'uvs-stats-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './scripts/app.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
