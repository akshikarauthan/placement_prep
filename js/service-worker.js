// Service worker for offline support
const CACHE_NAME = 'placement_prep-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/companies.html',
  '/roadmap.html',
  '/topics.html',
  '/questions.html',
  '/topic-roadmap.html',
  '/css/theme.css',
  '/css/responsive.css',
  '/js/api.js',
  '/js/config.js',
  '/js/progress.js',
  '/js/darkmode.js',
  '/assets/background.png',
  '/data/companies.json',
  '/data/data.json'
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