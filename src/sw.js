/** Service worker
 * By Matt Gaunt: https://developers.google.com/web/resources/contributors/mattgaunt
 * used under CC BY: https://creativecommons.org/licenses/by/3.0/
 * source: https://developers.google.com/web/fundamentals/primers/service-workers/
 * some changes by M. Radenovic
 */

var CACHE_NAME = 'restaurants-cache-v1';
var urlsToCache = [
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/dbhelper.js',
  '/js/scroll.js',
  '/js/restaurant_info.js',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request,  {'ignoreSearch': true})
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
