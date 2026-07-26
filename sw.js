const CACHE = 'nini-v3';
const FILES = ['./', './index.html', './app.js', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 网络优先策略：保证总是拿到最新版本，离线时才用缓存
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
  );
});
