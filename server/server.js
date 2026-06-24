/* 동선이 푸시 서버 — 앱을 꺼도 일정 시각에 Web Push 알림을 보냅니다.
   클라이언트가 /subscribe 로 구독정보 + 절대시각 알람목록을 보내면,
   30초마다 스캔해 도래한 알람을 Web Push 로 발송합니다. (VAPID 필요) */
const express = require("express");
const webpush = require("web-push");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8787;
const PUB = process.env.VAPID_PUBLIC;
const PRIV = process.env.VAPID_PRIVATE;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
if (!PUB || !PRIV) {
  console.error("❌ VAPID_PUBLIC / VAPID_PRIVATE 환경변수를 설정하세요.\n   키 생성: npx web-push generate-vapid-keys");
  process.exit(1);
}
webpush.setVapidDetails(SUBJECT, PUB, PRIV);

const DATA = process.env.DATA_FILE || path.join(__dirname, "data.json");
let store = {};                       // endpoint -> { subscription, alarms:[{id,at,title,body,sent}], ts }
try { store = JSON.parse(fs.readFileSync(DATA, "utf8")) || {}; } catch (_) {}
let saveT = null;
function persist() { clearTimeout(saveT); saveT = setTimeout(() => fs.writeFile(DATA, JSON.stringify(store), () => {}), 500); }

const app = express();
app.use(express.json({ limit: "256kb" }));
app.use((req, res, next) => {                 // 정적 사이트(다른 도메인)에서 호출하므로 CORS 허용
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (_req, res) => res.json({ ok: true, service: "dongseoni-push", subscriptions: Object.keys(store).length }));

app.post("/subscribe", (req, res) => {
  const { subscription, alarms } = req.body || {};
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: "no subscription" });
  const list = Array.isArray(alarms) ? alarms
    .filter(a => a && a.at && a.title)
    .slice(0, 300)
    .map(a => ({ id: String(a.id || a.at), at: +a.at, title: String(a.title).slice(0, 120), body: String(a.body || "").slice(0, 200), sent: false }))
    : [];
  store[subscription.endpoint] = { subscription, alarms: list, ts: Date.now() };
  persist();
  res.json({ ok: true, scheduled: list.length });
});

app.post("/unsubscribe", (req, res) => {
  const ep = (req.body || {}).endpoint;
  if (ep) delete store[ep];
  persist();
  res.json({ ok: true });
});

async function tick() {
  const now = Date.now();
  for (const ep of Object.keys(store)) {
    const rec = store[ep];
    if (!rec || !Array.isArray(rec.alarms)) continue;
    let changed = false;
    for (const a of rec.alarms) {
      if (a.sent) continue;
      if (a.at > now) continue;
      a.sent = true; changed = true;
      if (a.at < now - 10 * 60000) continue;     // 10분 넘게 지난 건 발송하지 않고 소진 처리
      try {
        await webpush.sendNotification(rec.subscription, JSON.stringify({ title: a.title, body: a.body, tag: "dongseoni-" + a.id }));
      } catch (err) {
        if (err && (err.statusCode === 404 || err.statusCode === 410)) { delete store[ep]; changed = true; break; }
      }
    }
    if (store[ep] && Array.isArray(store[ep].alarms)) {
      store[ep].alarms = store[ep].alarms.filter(a => !(a.sent && a.at < now - 24 * 3600000));   // 하루 지난 발송완료 알람 청소
    }
    if (changed) persist();
  }
}
setInterval(() => { tick().catch(() => {}); }, 30000);

app.listen(PORT, () => console.log("✅ 동선이 push server listening on :" + PORT));
