# 아이폰(App Store) 출시 가이드 — 동선이

방식: **PWABuilder iOS 패키지(WKWebView 원격로드 셸) → Codemagic 클라우드 빌드 → TestFlight → App Store**. 맥 불필요(Codemagic이 클라우드 mac 제공).

> ⚠️ **가장 큰 리스크는 빌드가 아니라 심사(Guideline 4.2 최소 기능성)입니다.** Google Play는 PWA 래퍼를 받아주지만 **Apple은 "웹사이트를 감싸기만 한 앱"을 루틴하게 반려**합니다. 무가입·정적 HTML이라 "그냥 Safari로 보면 되잖아"에 걸리기 쉬워요. → **셸에 네이티브 기능 1~3개를 얹고**, 심사 노트로 설명하는 전략이 필요합니다(아래 4번). **첫 제출 반려는 흔하니 일정에 여유를 두세요.**

---

## 0. 준비된 자산 (내가 만들어 둠)

| 자산 | 파일 | 용도 |
|---|---|---|
| 매니페스트·아이콘 | `manifest.json`, `icon-*.png` | PWABuilder iOS 입력 |
| App Store 아이콘 1024 | `icon-1024.png` | App Store Connect 업로드(알파 없음) |
| 개인정보처리방침 | `privacy.html` → `.../privacy.html` | 필수 URL |
| 고객 지원 페이지 | `support.html` → `.../support.html` | **iOS 필수 지원 URL** |
| 빌드 설정 | `codemagic.yaml` | Codemagic 클라우드 빌드(채울 변수 표시됨) |
| 심사 노트(영문) | 아래 6번 | 복붙용 |
| 등록정보(메타) | 아래 5번 | 복붙용 |

스크린샷(아래 7번)만 직접 캡처하면 됩니다.

---

## 1. 사전 준비 (사람만 가능)

1. **Apple Developer Program 가입 — 연 $99** (우회 불가).
2. **App Store Connect → 앱 추가**: 이름 `동선이`, 번들 ID `io.github.kmini0157.dongseoni`(원하는 값으로, 이후 일관 사용), 기본 메타 입력 → 생성되는 **숫자 Apple ID** 기록.
3. **App Store Connect API 키(.p8) 발급**: Users and Access → Integrations → App Store Connect API → **+** → 권한 **App Manager** → **Download API Key**(★1회만). **Issuer ID·Key ID·.p8 파일** 3개 보관.

## 2. PWABuilder로 iOS 프로젝트 생성

1. https://www.pwabuilder.com → URL `https://kmini0157.github.io/dongseoni/` → **Package For Stores → iOS** → Generate → zip 다운로드.
2. zip을 풀어 **실제 `.xcodeproj` 파일명**과 **공유 스킴(shared scheme) 이름**을 확인(보통 `App`이지만 버전마다 다름). → `codemagic.yaml`의 `XCODE_PROJECT`·`XCODE_SCHEME`에 그 값 반영.
3. (선택, 4.2 대비) 아래 4번의 네이티브 기능 패치를 셸에 적용.
4. PWABuilder 프로젝트 + `codemagic.yaml`을 GitHub repo에 push.

## 3. Codemagic 빌드 → TestFlight

1. https://codemagic.io → 그 repo 연결.
2. **Team settings → Team integrations → Developer Portal → Add key**: Issuer ID·Key ID 입력 + `.p8` 업로드 → 키 별칭을 `codemagic.yaml`의 `integrations: app_store_connect` 값과 일치.
3. `codemagic.yaml`의 `[채우기]` 변수(번들ID·프로젝트·스킴·앱 Apple ID·키 별칭) 채우기.
4. 빌드 실행 → `.ipa` 생성 → **TestFlight 자동 업로드** → 본인 아이폰에서 실작동 확인.

> 프로젝트/스킴 이름이 헷갈리면 처음엔 Codemagic UI로 자동 감지 빌드 → 감지된 값을 yaml에 옮기세요.

---

## 4. ★ 4.2(최소 기능성) 통과 전략 — iOS 핵심

웹뷰 셸을 "앱답게" 만들 네이티브 가치를 더합니다. 우선순위·난이도순:

### 4-1. 네이티브 오프라인 화면 (가장 쉽고 안전, 브리지 불필요)
WKWebView 로드 실패 시 브라우저 에러 대신 안내 화면을 네이티브로 표시. PWABuilder의 ViewController(WKNavigationDelegate)에서:
```swift
func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { showOffline() }
func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { showOffline() }
func showOffline() {
  let label = UILabel()
  label.text = "오프라인이에요.\n저장된 일정은 그대로 볼 수 있어요.\n연결되면 다시 시도해 주세요."
  label.numberOfLines = 0; label.textAlignment = .center; label.textColor = .white
  // ... 뷰에 add + 재시도 버튼(webView.reload())
}
```

### 4-2. 로컬 알림 (브리지 없이, 일반 리마인더)
일정 데이터를 JS에서 가져오는 건 4.7(커스텀 브리지) 위험 → **데이터 없는 일반 리마인더**로 안전하게. AppDelegate `didFinishLaunching`에서 권한 요청 + 매일 오전 알림:
```swift
import UserNotifications
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
let c = UNMutableNotificationContent()
c.title = "동선이"; c.body = "오늘 일정을 확인해 보세요."
var dc = DateComponents(); dc.hour = 8
let req = UNNotificationRequest(identifier: "daily", content: c,
  trigger: UNCalendarNotificationTrigger(dateMatching: dc, repeats: true))
UNUserNotificationCenter.current().add(req)
```
→ Info.plist에 별도 키 불필요. 심사관이 가장 먼저 찾는 "네이티브 알림" 충족.

### 4-3. 위치(SOS) — 표준 웹 API로 충분
앱의 SOS는 이미 표준 `navigator.geolocation`을 씁니다. WKWebView가 이를 지원하므로 **네이티브 코드 없이도 iOS 권한 다이얼로그가 뜹니다**(앱다움 증거). 단 Info.plist에 목적 문자열 필수:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>긴급(SOS) 시 현재 위치를 화면에 표시하기 위해 사용합니다. 위치를 저장하거나 전송하지 않습니다.</string>
```

### 4-7(2025-11) 준수 — 중요
커스텀 JS↔네이티브 브리지로 iOS 프레임워크를 노출하면 안 됩니다. → **표준 WebKit/웹 API만 사용**(위 4-1·4-2는 순수 네이티브, 4-3은 표준 웹). 앱 코드의 `openLink`도 커스텀 메시지 핸들러를 쓰지 않도록 이미 정리했습니다(표준 `window.open` → 셸이 Safari로 처리).

> 셸 적용이 막히면, PWABuilder zip의 실제 구조를 알려주세요 — 그 프로젝트에 맞춘 정확한 패치를 만들어 드립니다. (지금은 프로젝트가 생성되기 전이라 일반 스니펫으로 제공합니다.)

---

## 5. App Store Connect 입력값 (복붙)

- **이름**: `동선이` (타사 상표 카카오·네이버 등을 이름·부제·키워드에 넣지 말 것)
- **부제(30자)**: `날씨까지 엮어주는 여행 동선 비서`
- **프로모션 텍스트(170자)**: `가고 싶은 곳만 넣으면 날씨·이동시간을 엮어 하루 동선을 자동으로. 지금 어디서 몇 분 뒤 어디로 가야 할지 한 화면에.`
- **설명**: `STORE_ANDROID.md`의 자세한 설명과 동일 사용 가능.
- **키워드(100자, 쉼표구분)**: `여행,여행계획,여행일정,동선,코스,일정관리,여행지,국내여행,날씨,맛집`
- **카테고리**: 기본 **여행(Travel)** / 보조 내비게이션
- **지원 URL**: `https://kmini0157.github.io/dongseoni/support.html`
- **마케팅/개인정보 URL**: `https://kmini0157.github.io/dongseoni/privacy.html`
- **저작권**: `2026 동선이`

### 연령 등급
- 기본 **4+**.
- ⚠️ **고려사항(블로그 가져오기)**: 우리 "블로그 코스 가져오기"는 **URL의 본문을 외부에서 텍스트로 가져와 파싱**할 뿐, 앱 안에서 임의 웹페이지를 *브라우징*하지 않습니다. 따라서 "제한 없는 웹 접근(Unrestricted Web Access)"에는 해당하지 않을 가능성이 큽니다 → **4+ 유지 가능**. 다만 심사에서 문제 삼으면 (a) 등급을 올리거나 (b) "본문 붙여넣기 전용"으로 전환하면 됩니다. (사용자님은 URL 가져오기 유지를 선택하셨으니 일단 4+로 신고하고, 지적 시 대응.)

## 6. App Privacy(개인정보 영양표시) + 심사 노트

### App Privacy 라벨
- 전체 **"Data Not Collected"**(수집 안 함) 선언 — 앱 정체성과 정확히 일치(계정·분석·추적 0).
- 추적(ATT) 없음, IDFA 미사용.
- 위치: 라벨엔 미표시 가능(서버 미수집). 단 위 4-3의 Info.plist 목적문자열은 필수.
- 수출규정: Info.plist에 `ITSAppUsesNonExemptEncryption` = `false`(표준 HTTPS만) → 암호화 면제 신고.

### 심사 노트 (Review Notes, 영문 — 그대로 붙여넣기)
```
Dongseoni is a travel itinerary planner, not a repackaged website.

Native functionality beyond a web view:
1) Local notifications (UNUserNotificationCenter): a daily reminder to review the day's plan. Enable via the iOS permission prompt on first launch.
2) Native offline screen: when the network is unavailable, the app shows a native offline view with a retry button; saved itineraries remain viewable.
3) Location (standard WebKit Geolocation): the SOS screen shows the current coordinates on-device only. Reach it via the home screen "SOS" button. Coordinates are never stored or sent to our servers.

How to evaluate:
- Home tab: shows the current/next step of the itinerary with weather and travel time.
- Edit tab: add places, restaurants, lodging; the app auto-arranges an optimal route.
- Timeline tab: per-day route with arrival/departure times.

Privacy: no account, no login, no ads, no tracking, no analytics. All itinerary data is stored locally on device.
Compliance: we use only standard WebKit / web APIs; no custom JavaScript-to-native bridge exposes private or native frameworks (Guideline 4.7).

Test data: no login required. Just open and use.
```

## 7. 스크린샷 (직접 캡처, 필수)

- 필수 사이즈: **6.7"(1290×2796)** 1세트면 대부분 커버. 6.5"도 요구될 수 있음.
- 캡처법: 본인 아이폰에서 TestFlight 빌드 실행 → 일정 몇 개 넣고 홈/타임라인/편집 캡처(전원+볼륨업). 또는 Xcode 시뮬레이터(맥 없으면 어려움) → 실기기 권장.
- 추천 4장: 홈(마스코트+다음일정) · 타임라인(동선) · 편집(입력) · 지도 도시선택.

---

## 8. 사람만 가능한 단계 (내가 못 하는 것)
- Apple Developer 가입·$99 결제, ASC 앱 생성, .p8 발급
- PWABuilder iOS zip 생성, repo push
- Codemagic 키 등록·변수 입력·빌드 실행
- TestFlight 실기기 검증, 스크린샷 캡처
- App Privacy·메타 입력, **심사 제출 클릭**, 반려 시 대응

내가 끝낸 것: codemagic.yaml·support.html·privacy.html·아이콘1024·등록정보 카피·영문 심사노트·네이티브 기능 스니펫·4.2/4.7 전략.
