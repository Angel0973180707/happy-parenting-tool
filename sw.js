const CACHE_NAME = 'parenting-rescue-cache-v1';
const urlsToCache = [
  '/', 
  'index.html',
  'style.css',
  'script.js',
  'manifest.json'
  // 提示：正式上線時，您需要取消註釋並加入所有圖標的路徑，確保離線時也能顯示圖標
  // '/icons/icon-192x192.png', 
  // '/icons/icon-512x512.png',
];

// 安裝 Service Worker 並緩存文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // 強制新的 Service Worker 立即啟用
});

// 攔截請求，從緩存中獲取內容
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 緩存中找到，則回傳緩存內容
        if (response) {
          return response;
        }
        // 緩存中沒有，則嘗試從網路獲取
        return fetch(event.request);
      })
  );
});

// 清理舊的緩存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // 刪除不屬於白名單的舊緩存
          }
        })
      );
    })
  );
});
