# Google 인증 CMP(개인정보 보호 및 메시지) 연결 가이드

EEA·영국(UK) 트래픽에 **정식 GDPR 준수**로 광고를 게재하려면 Google 인증 CMP가 필요합니다.
동선이에는 Google의 **Privacy & messaging(구 Funding Choices)** 로더가 이미 코드에 연결돼 있고,
**메시지 자체는 AdSense 콘솔에서 만들어 게시**해야 화면에 나타납니다.

## 동작 방식
```
index.html(USE_GOOGLE_CMP=true) ──로더 스니펫──▶ fundingchoicesmessages.google.com/i/pub-XXXX
        ▲                                                  │
   Consent Mode 기본=거부                        Google 동의 메시지(인증 CMP, IAB TCF)
        └──────────── 사용자가 선택하면 Google이 Consent Mode 자동 업데이트 ──────────┘
```
- `USE_GOOGLE_CMP = true`(기본)이면 **자체 쿠키 배너는 표시되지 않고**, Google 인증 메시지가 동의를 처리합니다.
- `<head>`의 Consent Mode 기본값(거부)은 그대로 두며, CMP가 사용자의 선택에 따라 갱신합니다.
- 광고 게이팅은 AdSense가 TCF 신호로 직접 처리합니다(앱이 별도로 막지 않음).

## 설정 단계
1. **AdSense 가입·사이트 승인**을 먼저 마칩니다.
2. AdSense 콘솔 → **개인정보 보호 및 메시지(Privacy & messaging)** 탭으로 이동.
3. **GDPR 메시지 만들기** → 사이트 선택 → 문구/색상/언어(한국어 포함) 설정 → **게시(Publish)**.
   - 필요하면 **미국 주 규정(US states)·CCPA** 메시지도 함께 생성.
4. 게시자 ID 확인(`ca-pub-XXXXXXXXXXXXXXXX`).
5. `index.html` 상단 상수를 채웁니다.
   ```js
   const ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";
   const ADSENSE_BANNER_SLOT = "1234567890";   // 디스플레이 슬롯(선택)
   const USE_GOOGLE_CMP = true;                // Google 인증 CMP 사용
   ```
6. `ads.txt`의 `pub-0000000000000000`도 본인 ID로 교체.
7. 재배포하면 EEA/UK 사용자에게 Google 동의 메시지가 자동 표시됩니다.

## 동의 철회(필수 요건)
앱 하단 푸터의 **‘쿠키 설정’**을 누르면 `googlefc.showRevocationMessage()`로 Google 동의 메시지를 다시 띄워
사용자가 언제든 선택을 변경할 수 있습니다. (코드에 연결돼 있음)

## 자체 배너로 되돌리려면
`USE_GOOGLE_CMP = false`로 두면 Google CMP 대신 앱 내장 쿠키 배너 + Consent Mode가 동작합니다.
단, 자체 배너는 IAB TCF 문자열을 생성하지 않아 **EEA 정식 준수가 아니며** 한국 위주 트래픽의 임시 UX로만 권장합니다.

## 참고
- Privacy & Messaging 문서: https://developers.google.com/funding-choices
- 메시지를 **게시(Publish)** 하지 않으면 스니펫만 있어도 아무것도 표시되지 않습니다.
