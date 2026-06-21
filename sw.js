/* 동선이 서비스워커 — 셸 오프라인 캐시. network-first(온라인=최신, 오프라인=캐시) */
const CACHE = "dongseoni-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "./apple-touch-icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;   // 외부 API/CDN(날씨·카카오·Jina·jsdelivr)은 항상 네트워크
  e.respondWith(
    fetch(e.request).then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return resp; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
