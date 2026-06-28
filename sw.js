/* 동선이 서비스워커 — 셸 오프라인 캐시. network-first(온라인=최신, 오프라인=캐시) */
const CACHE = "dongseoni-v4";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "./apple-touch-icon-180.png", "./privacy.html", "./terms.html", "./about.html"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* 푸시 수신 → 앱이 꺼져 있어도 시스템 알림 표시 */
self.addEventListener("push", e => {
  let d = { title: "동선이", body: "일정 알림" };
  try { if (e.data) d = Object.assign(d, e.data.json()); }
  catch (_) { try { d.body = e.data.text(); } catch (__) {} }
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, icon: "./apple-touch-icon-180.png", badge: "./icon.svg",
    tag: d.tag || "dongseoni-alarm", renotify: true, data: { url: "./" }, vibrate: [180, 90, 180]
  }));
});
/* 일정 알람 알림 클릭 → 앱으로 포커스(없으면 새로 열기) */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow("./");
  }));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;   // 외부 API/CDN(날씨·카카오·Jina·jsdelivr)은 항상 네트워크
  e.respondWith(
    fetch(e.request).then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return resp; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
