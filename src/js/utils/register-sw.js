/** Service worker registration
 * By Matt Gaunt: https://developers.google.com/web/resources/contributors/mattgaunt
 * used under CC BY: https://creativecommons.org/licenses/by/3.0/
 * source: https://developers.google.com/web/fundamentals/primers/service-workers/
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
  