const CACHE = 'nini-v19';
const FILES = [
  './manifest.json', './icon-v2-192.png', './icon-v2-512.png', './favicon.ico'
];

// 静态资源预缓存（仅图标/manifest 等不会改变的文件）
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
      return self.clients.matchAll({ includeUncontrolled: true }).then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: CACHE }))
      );
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// 缓存策略：
// - .html / .js（代码文件）：始终网络优先 + cache:no-store，永不缓存 → 保证每次拿到最新，彻底避免死锁
// - 其他静态资源：网络优先 + 缓存（离线可用）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isCode = url.pathname.endsWith('.html') || url.pathname.endsWith('.js') ||
                 url.pathname === '/' || url.pathname.endsWith('/');

  if (isCode) {
    // 代码文件：网络优先，禁用浏览器 HTTP 缓存，不写入 SW 缓存
    e.respondWith(
      fetch(e.request, { cache: 'no-store', cacheControl: 'no-cache' }).catch(() =>
        fetch(e.request).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // 其他资源：网络优先 + 缓存
  e.respondWith(
    fetch(e.request).then(networkResp => {
      if (networkResp && networkResp.status === 200) {
        const copy = networkResp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return networkResp;
    }).catch(() =>
      caches.match(e.request).then(cached => cached || caches.match('./index.html'))
    )
  );
});
