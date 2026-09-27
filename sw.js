const CACHE_NAME = 'monomochi-no-ki-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.addAll(ASSETS); })
      .catch(function() { /* キャッシュ失敗時もインストールを止めない */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).catch(function() {})
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).catch(function() {
          return cached; // オフライン時はキャッシュがあればそれを返す（無ければ undefined）
        });
      })
      .catch(function() { return fetch(event.request); })
  );
});
