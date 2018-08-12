/** Service worker
 * By Matt Gaunt: https://developers.google.com/web/resources/contributors/mattgaunt
 * used under CC BY: https://creativecommons.org/licenses/by/3.0/
 * source: https://developers.google.com/web/fundamentals/primers/service-workers/
 * some changes by M. Radenovic
 */

import idb  from './js/utils/idbService.js';
import remote from './js/utils/remoteService.js';

var CACHE_NAME = 'restaurants-cache-v1';
var urlsToCache = [
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/js/index.js',
  '/js/restaurant.js',
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
    caches.match(event.request,  {ignoreSearch: true})
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
            let skipCache = !response || response.status !== 200;
            skipCache |= response.type !== 'basic' && response.type !== 'cors';
            skipCache |= response.url.includes('/reviews/');
            if(skipCache) {
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

self.addEventListener('sync', function(event) {
  const [method, url, data] = event.tag.split('@');
  console.log(method, url, data);
  event.waitUntil(sync(event.tag));
});

function sync(tag) {
  const [method, url, data] = tag.split('@');
  switch (method) {
    case 'POST':
      remote.postReview(url, data)
        .then(review => idb.postRecords('reviews', [review]))
        .catch(e => console.log('Background sync (Post review) failed:', e));
      break;
    case 'PUT':
      remote.putFavorite(url)
        .then(restaurant => idb.putRecords('restaurants', [restaurant]))
        .catch(e => console.log('Background sync (Put restaurant) failed:', e));
      break;
    default:
      console.log('Unsupported sync request');
  }
}