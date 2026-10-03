'use strict';

/**
 * Cache name is derived from the `?v=<build id>` query string used when the
 * worker is registered (see lib/offline/sw.ts). A new build produces a new
 * script URL, which triggers an install and activates a fresh cache while the
 * activate handler purges every older `buddy-cache-*` entry (ARCH-P2-001).
 */
function resolveCacheName() {
  try {
    var version = new URL(self.location.href).searchParams.get('v');
    if (version) return 'buddy-cache-' + version;
  } catch (error) {
    // fall through to the generic name
  }
  return 'buddy-cache-dev';
}

var CACHE_NAME = resolveCacheName();
var ASSETS_TO_CACHE = ['/', '/manifest.json', '/icon-192.svg', '/icon-512.svg'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (name) {
              return name !== CACHE_NAME;
            })
            .map(function (name) {
              return caches.delete(name);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then(function (response) {
          if (response && response.status === 200 && response.type === 'basic') {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(function () {
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
