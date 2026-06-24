# 동선이 푸시 서버 (앱을 꺼도 울리는 알람)

정적 사이트(GitHub Pages)만으로는 **앱을 완전히 종료한 상태에서 알람을 울릴 수 없습니다.**
브라우저의 **Web Push**는 OS의 푸시 서비스(FCM/APNs/Mozilla)를 통해 전달되며, 그러려면
VAPID 키를 가진 **작은 서버**가 정해진 시각에 푸시를 보내줘야 합니다. 이 폴더가 그 서버입니다.

```
앱(브라우저) ──구독+일정시각── ▶ 이 서버 ──매분 스캔, 도래시 발송── ▶ 푸시서비스 ──▶ 기기 알림
```

## 1) VAPID 키 생성
```bash
cd server
npm install
npm run gen-keys          # = npx web-push generate-vapid-keys
```
출력된 `Public Key` / `Private Key`를 메모하세요.

## 2) 로컬 실행
```bash
cp .env.example .env      # .env 에 위 키 2개와 메일 주소 입력
npm start                 # http://localhost:8787
```

## 3) 배포 (택1, 무료 티어 가능)
- **Render**: New → Web Service → 이 저장소(루트 디렉터리 `server`) → Build `npm install` / Start `npm start` → 환경변수에 `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_SUBJECT` 추가.
- **Railway / Fly.io / Cloudtype(국내)**: 동일하게 `server/`를 Node 앱으로 배포하고 환경변수 3개 등록.
- 영구 저장이 필요하면 디스크를 붙이고 `DATA_FILE`을 그 경로로 지정(없어도 동작하나 재시작 시 예약 초기화).

## 4) 앱(index.html)에 연결
`index.html` 상단의 두 상수를 채우고 다시 배포하세요.
```js
const PUSH_SERVER = "https://<배포주소>";   // 예: https://dongseoni-push.onrender.com
const VAPID_PUBLIC = "<1)에서 만든 Public Key>";
```
그러면 타임라인 탭에 **“📲 앱 꺼도 알람 받기 — 푸시 켜기”** 버튼이 나타납니다.
누르면 알림 권한을 받고 구독되며, 일정이 바뀔 때마다 서버로 자동 동기화됩니다.

## API
| 메서드 | 경로 | 본문 | 설명 |
|---|---|---|---|
| GET | `/` | – | 상태 확인 |
| POST | `/subscribe` | `{ subscription, alarms:[{id,at,title,body}] }` | 구독 등록/갱신(전체 교체). `at`=절대시각(ms) |
| POST | `/unsubscribe` | `{ endpoint }` | 구독 해지 |

## 참고 / 한계
- **iOS**는 Safari에서 **홈 화면에 추가(PWA 설치)** 한 경우에만 Web Push가 동작합니다(iOS 16.4+). 일반 사파리 탭은 미지원.
- 발송 정확도는 분 단위(서버가 30초마다 스캔). 푸시 서비스 지연이 수 초~수십 초 있을 수 있습니다.
- 서버는 알람을 절대시각(ms)으로만 다루므로 앱 로직을 몰라도 됩니다. 일정이 바뀌면 앱이 목록을 통째로 다시 보냅니다.
