const CACHE = 'nini-v12';
const FILES = [
  './', './index.html', './app.js', './builtin-data.js',
  './manifest.json', './icon-v2-192.png', './icon-v2-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 网络优先策略：联网时拿最新数据并更新缓存，离线时用缓存
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(networkResp => {
      if (networkResp && networkResp.status === 200) {
        const copy = networkResp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return networkResp;
    }).catch(() =>
      caches.match(e.request).then(cached =>
        cached || caches.match('./index.html')
      )
    )
  );
});
