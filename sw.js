const CACHE = 'nini-v17';
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
    ).then(() => self.clients.claim()).then(() => {
      // 通知所有已打开的页面：有新版本，立即刷新以加载最新资源
      return self.clients.matchAll({ includeUncontrolled: true }).then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: CACHE }))
      );
    })
  );
});

// 监听页面消息：强制刷新
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
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
