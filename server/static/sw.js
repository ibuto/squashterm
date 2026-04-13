const cacheName = "squashterm-v11"; // v11: PRレビュー対応 (spotify-ui.js追加、アクセシビリティ修正)
const staticAssets = [
  "/",
  "/static/styles.css",
  "/static/spotify-ui.css",
  "/static/app.js",
  "/static/spotify-ui.js",
  "/static/images/logo.png",
  "/static/images/icon.png",
  "/static/manifest.webmanifest",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  // 1 ファイルでも失敗しても SW インストール自体はブロックしない
  // skipWaiting を waitUntil チェーンに含めて有効化タイミングを確実に制御する
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => Promise.allSettled(staticAssets.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  // /media/ と /api/ は常にネットワークから取得（キャッシュしない）
  if (requestUrl.pathname.startsWith("/media/") || requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseClone = response.clone();
        caches.open(cacheName).then((cache) => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});
