var CACHE_NAME = "pwa-task-manager";
var urlsToCache = ['/', '/auth'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('Opened Cache');
      return cache.addAll(urlsToCache);
    }))
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
      )
  );
})

self.addEventListener('activate', event => {
  var cacheWhitelist = ['pwa-task-manager'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});