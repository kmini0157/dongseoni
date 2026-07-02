# 안드로이드(Google Play) 출시 가이드 — 동선이

방식: **PWA → TWA(Trusted Web Activity)**. [PWABuilder](https://www.pwabuilder.com)가 `manifest.json`을 읽어 서명된 `.aab`를 만들어 줍니다. 맥/안드로이드 스튜디오 불필요(Windows로 가능).

> ⚠️ **가장 큰 변수(2023년 11월 이후 만든 개인 개발자 계정):** 프로덕션 출시 전에 **비공개 테스트(Closed testing)를 최소 12명 이상 테스터로 14일 연속** 진행해야 프로덕션 신청이 열립니다. 계정 만들면 이 절차부터 시작하세요(가장 오래 걸리는 단계).

---

## 0. 준비된 자산 (내가 만들어 둠 — 그대로 사용)

| 자산 | 파일 | 용도 |
|---|---|---|
| 매니페스트 | `manifest.json` | PWABuilder 입력(192·512·maskable PNG 포함 완료) |
| 앱 아이콘(고해상) | `play-icon-512.png` (512×512) | Play 스토어 등록 아이콘 |
| 피처 그래픽 | `feature-graphic.png` (1024×500) | Play 필수 그래픽 |
| 마스커블 아이콘 | `icon-maskable-512.png` | 적응형 아이콘 |
| 도메인 인증 | `.well-known/assetlinks.json` | TWA 링크 검증(지문만 채우면 됨) |
| 개인정보처리방침 | `privacy.html` → `https://kmini0157.github.io/dongseoni/privacy.html` | Play 필수 URL |

스크린샷(폰 2~8장)만 직접 캡처하면 됩니다 → 아래 4번.

---

## 1. 사전 배포 (먼저)

GitHub Pages에 최신 파일을 올려 `https://kmini0157.github.io/dongseoni/` 가 PWA로 동작하게 합니다(아이콘·manifest·sw 포함). → `RELEASE.md`의 배포 파일 목록 참고.

## 2. PWABuilder로 .aab 생성

1. https://www.pwabuilder.com 접속 → URL에 `https://kmini0157.github.io/dongseoni/` 입력 → Start.
2. 점수/매니페스트 확인(아이콘·screenshots 경고는 무시 가능). **Package For Stores → Android**.
3. 옵션에서 **Package ID**를 `io.github.kmini0157.dongseoni` 로 설정(assetlinks.json과 일치해야 함). App name `동선이`.
4. **Signing key: 새로 생성(PWABuilder가 keystore 생성)** 선택 → `.aab` + `signing key(.keystore)` + `assetlinks.json` 들어있는 zip 다운로드.
   - ⚠️ **이 keystore와 비밀번호는 영구 보관**(분실 시 앱 업데이트 불가).

## 3. Digital Asset Links(도메인 인증) — 중요 + 위치 주의

TWA가 주소창 없이 풀스크린으로 뜨려면 도메인 인증이 필요합니다.

⚠️ **위치 핵심(많이 틀리는 부분):** TWA는 assetlinks.json을 **오리진 루트**에서 찾습니다. 앱은 `/dongseoni/`에 있어도 검증 파일은 반드시
`https://kmini0157.github.io/.well-known/assetlinks.json` (경로 없는 **루트**)에 있어야 합니다.
- `kmini0157.github.io`는 GitHub **사용자 페이지**라 루트가 **별도 레포**(repo 이름이 정확히 `kmini0157.github.io`)입니다. 그 루트 레포의 `.well-known/assetlinks.json`에 둬야 합니다 — 이 프로젝트(`dongseoni`) repo의 `/dongseoni/.well-known/`이 **아닙니다.**
- 루트 레포가 없으면: GitHub에서 `kmini0157.github.io` 이름으로 **public repo** 생성 → 그 안에 `.well-known/assetlinks.json` 업로드(이 파일을 복사해서 사용).

**지문 채우는 순서(지문이 2개라 주의):**
1. PWABuilder zip 안 `assetlinks.json`의 **업로드 키 SHA-256**을 복사 → 루트 `.well-known/assetlinks.json`의 placeholder 자리에 붙여넣고 배포.
2. Play에 `.aab` 업로드(Play App Signing 자동 적용).
3. Play Console → **설정 → 앱 무결성 → 앱 서명**에서 **"앱 서명 키 인증서"의 SHA-256**(Google 재서명 키)을 복사 → 같은 파일 `sha256_cert_fingerprints` 배열에 **추가**(업로드키·앱서명키 둘 다 넣기) → 재배포.
4. 검증: 위 URL이 브라우저에서 열리고, 앱 실행 시 **주소창이 안 보이면 성공**. 주소창이 남으면 앱 서명 키 지문 누락.

`package_name`은 `io.github.kmini0157.dongseoni` (PWABuilder Package ID와 일치).

## 4. 스크린샷 캡처 (직접, 2~8장)

PC 크롬에서 `https://kmini0157.github.io/dongseoni/` 열고 → F12 → 기기 툴바(Ctrl+Shift+M) → 기기 "iPhone 12 Pro" 또는 해상도 1080×1920 → 일정을 몇 개 넣고 → **홈 / 타임라인 / 편집** 화면을 캡처(우클릭 → 스크린샷, 또는 기기툴바 메뉴 "Capture screenshot").
- Play 요건: 최소 2장, 16:9 또는 9:16, 320~3840px. 세로 폰 권장.
- 추천 4장: ① 홈(마스코트+다음일정) ② 타임라인(동선) ③ 편집(입력) ④ 지도 도시선택.

## 5. Google Play Console 등록

1. https://play.google.com/console → **$25 일회성 결제** + **신원확인**(신분증·전화·이메일) + **안드로이드 실기기 1대로 기기 확인**(신규 개인계정 필수). ※ 생성된 AAB의 **targetSdk가 35(Android 15)+** 인지 확인(PWABuilder 최신 버전이면 충족).
2. **앱 만들기** → 이름 `동선이`, 언어 한국어, 무료, 앱.
3. **프로덕션 아님 → 비공개 테스트 트랙 먼저**(위 경고 참고) → `.aab` 업로드.
4. 아래 **등록정보·정책 폼** 작성(섹션 6).
5. 비공개 테스트 14일·12명+ 충족 → 프로덕션 신청 → 심사(보통 며칠).

---

## 6. Play Console 입력값 (그대로 복붙)

### 앱 이름
`동선이 · 전국 여행 비서`

### 간단한 설명 (≤80자)
`가고 싶은 곳만 넣으면 날씨·이동시간 엮어 동선을 짜주는 여행 비서`

### 자세한 설명 (≤4000자)
```
여행지를 정했는데 동선 짜기가 막막한가요?

동선이는 가고 싶은 곳·맛집·숙소만 넣으면, 날씨와 이동시간을 엮어 하루 동선을 자동으로 짜줍니다. "지금 어디서, 몇 분 뒤, 어디로" 가야 할지 한 화면으로 보여줍니다.

■ 한 화면 동선
- 권역끼리 묶어 도착·출발 시각과 이동시간을 계산
- 지금 할 일과 다음 일정만 압축해서 표시

■ 최적 코스 자동 정리
- 맛집은 아침·점심·저녁 시간에 자동 배정
- 볼거리는 가까운 순으로 엮어 이동 거리 최소화

■ 전국 어디든
- 지도에서 지역을 눌러 도시 선택, 전국 시·군 지원
- 며칠 일정과 날짜별 다른 도시·숙소도 OK

■ 실시간 날씨 연동
- 시간대별 강수 확률을 일정에 반영
- 비 올 확률이 높으면 실내 대안을 제안

■ 맛집·명소 추천
- 인기·추천순으로 정렬된 맛집과 한국관광공사 공식 명소·사진
- 실제 평점은 카카오맵에서 바로 확인

■ 가볍고 안전하게
- 가입·로그인 없음, 광고 없음, 추적 없음
- 입력은 내 기기에만 저장, 링크 하나로 동행자와 공유

지금 떠나는 여행, 동선이와 함께 가볍게 계획하세요.
```

### 카테고리·연락처
- 앱 카테고리: **여행 및 지역정보 (Travel & Local)**
- 태그: 여행, 길찾기, 일정
- 개인정보처리방침 URL: `https://kmini0157.github.io/dongseoni/privacy.html`
- 이메일: `asdewkkm@linkidmail.com`

### 콘텐츠 등급 설문 (IARC) — 예상 답
- 카테고리: **유틸리티/생산성/기타** (게임 아님)
- 폭력·성적·욕설·약물·도박 콘텐츠: **모두 없음/아니오**
- 사용자 간 소통/위치 공유 기능: 없음(공유는 본인 링크 복사만)
- → 결과: 전체이용가 / PEGI 3 / ESRB Everyone 예상

### 데이터 보안(Data Safety) 폼 — 이 앱 실제 기준
- **데이터를 수집·공유합니까?** → 핵심: 앱 운영자 서버로 **수집 안 함**(모두 기기 내 localStorage). 단, 외부 API 호출 시 일부 정보가 제3자(Open-Meteo, Kakao, ODsay, TourAPI, 블로그 가져오기 시 Jina/allOrigins)로 **전송**됨 → Google은 "제3자로 전송"도 처리로 봄. 보수적으로 아래처럼 신고:
  - **위치(대략/정확)**: 수집 안 함(앱 운영자). SOS 시 기기 좌표를 화면 표시용 일회성 사용, 서버 저장/전송 없음 → "수집 안 함"으로 두되, 애매하면 "앱 기능, 수집됨/공유 안 됨, 선택적"으로.
  - **앱 활동/검색어**: 장소 검색어가 Kakao/TourAPI로 전송됨 → "공유됨, 앱 기능, 수집 안 됨(서버 저장 없음)".
  - **개인 식별정보/연락처/금융/사진/메시지**: **없음**.
  - 전송 구간 **암호화(HTTPS)**: 예.
  - 데이터 삭제 요청 방법: 앱 내 '전체 초기화' 또는 저장소 삭제 → privacy.html에 명시됨.
- (정확한 토글은 Play Console 폼 문구에 맞춰 위 내용대로 선택. privacy.html이 근거 문서.)

### 대상 연령
만 13세 이상(특정 아동 타깃 아님). "아동 대상 아님"으로 설정.

---

## 7. 사람만 가능한 단계 (내가 못 하는 것)
- Google Play 개발자 계정 생성 + $25 결제 + 신원확인
- PWABuilder 실행·다운로드(웹 클릭), keystore 보관
- Play Console 업로드·폼 제출·비공개 테스트 모집·프로덕션 신청
- 스크린샷 캡처

내가 끝낸 것: 매니페스트·아이콘 전 사이즈·피처그래픽·assetlinks 스캐폴드·privacy(실이메일)·등록정보 카피·정책 답안.
