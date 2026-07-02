# 출시 핸드오프 — 동선이 (안드로이드 + 아이폰)

이 문서는 "지금부터 스토어에 올리기까지" 사용자님이 직접 할 일을 순서대로 묶은 마스터 체크리스트입니다.
세부 절차는 [`STORE_ANDROID.md`](STORE_ANDROID.md) · [`STORE_IOS.md`](STORE_IOS.md) 참고.

---

## 0. 지금 상태 한눈에

✅ **내가 끝낸 것 (코드·자산·설정·문서)**
- 앱 코드: 출시 차단요소 수정 완료(개인정보 이메일 실제값, 웹뷰 링크 폴백, CDN 타임아웃, iOS 4.7 준수 정리), 콘솔 에러 0, 회귀 0
- 프로 UI: 이모지 정리(헤더 색막대 등) — 검증된 3화면 스크린샷 양호
- 아이콘 전 사이즈: `icon-192/512`, `icon-maskable-192/512`, `apple-touch-icon-180`, `icon-1024`, `play-icon-512`, `favicon-32`
- Play 피처 그래픽: `feature-graphic.png` (1024×500)
- 매니페스트/SW: `manifest.json`(PNG 아이콘 반영), `sw.js`(v3)
- 법무 페이지: `privacy.html`(처리위탁·국외이전 포함), `support.html`(iOS 필수)
- 빌드 설정: `codemagic.yaml`(iOS), `.well-known/assetlinks.json` 스캐폴드
- 등록정보 카피(KO)·콘텐츠등급/데이터보안/영양표시 답안·영문 심사노트
- 가이드: `STORE_ANDROID.md`, `STORE_IOS.md`, 이 문서

🔴 **사용자님만 가능한 것** = 계정·결제·신원확인·실기기·외부 웹사이트 클릭(PWABuilder/콘솔/Codemagic)·스크린샷·업로드·심사 제출. 아래 단계가 그것.

💲 **비용**: GitHub Pages 0원 · Google Play $25(1회) · Apple Developer $99/년.
⏱ **가장 오래 걸리는 것**: 안드로이드 신규 개인계정의 **비공개 테스트 12명 × 14일**, iOS **첫 심사(반려 가능)**.

---

## 1단계 — PWA 재배포 (둘 다의 토대)

GitHub `kmini0157/dongseoni` repo에 아래 파일을 업로드(덮어쓰기):

```
index.html              (필수 — 모든 수정 포함)
manifest.json           (PNG 아이콘 반영)
sw.js                   (v3)
privacy.html            (실제 이메일)
support.html            (신규)
icon-192.png  icon-512.png
icon-maskable-192.png  icon-maskable-512.png
apple-touch-icon-180.png  icon-1024.png  play-icon-512.png  favicon-32.png
feature-graphic.png
README.md
```
- `_build/`(아이콘 생성 도구)는 **올릴 필요 없음**(`.gitignore`에 제외됨).
- 배포 후 `https://kmini0157.github.io/dongseoni/` 가 정상 동작하는지 폰에서 확인.
- ⚠️ **assetlinks.json은 여기 말고 "루트 레포"에** → 2단계 참고.

## 2단계 — 안드로이드 (Google Play)

자세히: [`STORE_ANDROID.md`](STORE_ANDROID.md)

1. 🔴 안드로이드 폰 준비 + Play 개발자 등록($25)·신원확인·기기확인.
2. 🔴 PWABuilder.com → Android 패키지 생성(Package ID `io.github.kmini0157.dongseoni`) → `.aab`·keystore 다운로드 → **keystore 영구 백업**.
3. 🔴 **루트 레포 `kmini0157.github.io`** 생성(없으면) → `.well-known/assetlinks.json` 업로드 + 업로드키 지문 붙여넣기.
4. 🔴 Play Console → 앱 생성 → **비공개 테스트** 트랙에 `.aab` 업로드.
5. 🟡 폼 작성: 콘텐츠 등급(전체이용가)·데이터 보안(수집 안 함)·개인정보 URL·스크린샷. (답안은 STORE_ANDROID.md에 준비됨)
6. 🔴 앱 서명 키 SHA-256을 assetlinks.json에 **추가** → 재배포 → 주소창 사라지는지 확인.
7. 🔴 테스터 12명 14일 → 프로덕션 신청 → 출시.

## 3단계 — 아이폰 (App Store)

자세히: [`STORE_IOS.md`](STORE_IOS.md)

1. 🔴 Apple Developer 가입($99) → ASC 앱 생성 → .p8 API 키 발급.
2. 🔴 PWABuilder.com → iOS 패키지 생성 → zip 풀어 `.xcodeproj`·스킴 이름 확인 → repo push(+ `codemagic.yaml`).
3. 🟡 (4.2 대비) 네이티브 기능 패치 적용 — STORE_IOS.md 4번 스니펫. 막히면 zip 구조 알려주시면 정확한 패치 제작.
4. 🔴 Codemagic 연결 → .p8 키 등록 → yaml `[채우기]` 변수 입력 → 빌드 → TestFlight.
5. 🔴 실기기 검증 + 스크린샷 캡처.
6. 🟡 App Privacy(수집 안 함)·메타·**영문 심사노트**(STORE_IOS.md 6번) 입력.
7. 🔴 심사 제출 → (반려 시 STORE_IOS.md 4번대로 네이티브 보강 후 재제출).

---

## 출시 후 / 확장 시 챙길 것 (지금은 아님)

- **ODsay 키 보호**: 현재 `DEFAULT_ODSAY`는 소스에 노출돼 있고 도메인잠금이 ODsay엔 무력(외부에서 쿼터 도용 가능). 출시·심사엔 지장 없으나, **수천 명 규모로 커지면** 무료 쿼터가 금방 소진됩니다 → 그때 Cloudflare Workers 같은 경량 프록시로 키를 숨기거나(권장) `DEFAULT_ODSAY` 제거(미입력 시 추정 폴백). 카카오 키는 Referer 잠금이라 안전, 그대로 OK.
- **블로그 가져오기 URL**: 유지 결정하셨고 개인정보처리방침에 고지됨. iOS 심사에서 웹접근을 문제 삼으면 "본문 붙여넣기 전용"으로 축소 옵션 있음(STORE_IOS.md 5번).
- **실제 기기 스크린샷**으로 manifest/스토어 이미지 고도화(선택).

---

## 한 줄 요약
코드·자산·설정·등록정보·심사노트까지 **제출 직전 상태로 전부 준비 완료**. 남은 건 계정·결제·외부 도구 클릭·업로드처럼 **사용자님 본인만 할 수 있는 단계**뿐입니다. 위 1→2→3 순서대로 진행하시면 됩니다.
