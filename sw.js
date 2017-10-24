const cacheName = 'news-v1';

const staticAssets = [
  './',
  './app.js',
  './styles.css',
  './fallback.json',
  './images/fetch-dog.jpg'
];

self.addEventListener('install', async function () {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);
  if (requestURL.origin == location.origin) {
    event.respondWith(cacheFirst(event));
  } else {
    event.respondWith(networkFirst(event));
  }
});

async function cacheFirst(event) {
  const cachedResponse = await caches.match(event.request);
  return cachedResponse || fetch(event.request);
}

async function networkFirst(event) {
  const dynamicCache = await caches.open('news-dynamic');
  try {
    const networkResponse = await fetch(event.request);
    dynamicCache.put(event.request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    const cachedResponse = await dynamicCache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    } else {
      return caches.match('/fallback.json');
    }
  }

}