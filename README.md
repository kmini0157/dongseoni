# 동선이 · 전국 여행 비서

가고 싶은 곳·맛집·숙소를 넣으면 **날씨·영업시간·이동시간을 엮어 동선을 짜주고**, "지금 어디서 몇 분 뒤 어디로"를 한 화면으로 보여주는 여행 비서.

서버 비용 0원 · 가입 없음 · 추적/광고 없음. 단일 `index.html` 정적 웹앱(PWA).

라이브: https://kmini0157.github.io/dongseoni/

---

## 주요 기능

- **단일 화면 동선** — 권역끼리 묶어 도착/출발 시각·이동시간을 계산, 지금/다음만 압축해서 표시
- **최적 코스 자동 정리** — 맛집은 아침·점심·저녁 시간에 자동 배정, 볼거리는 가까운 순으로 엮어 동선 최소화(TSP + 끼니 시간창)
- **멀티데이·멀티시티** — 며칠 일정 + 날짜별 다른 도시·숙소
- **전국 지원** — 지도에서 도(道)→도시 클릭 선택, 전국 162개 시/군 자동 등록
- **실시간 날씨** — Open-Meteo(무키), 비 확률 60%↑ 시 실내 대안(Plan B) 제안
- **맛집·놀거리 추천** — 카카오 검색 인기·추천순 정렬 + 한국관광공사(TourAPI) 공식 명소·사진. 실제 평점은 카카오맵 딥링크로 위임(약관 안전)
- **블로그 코스 가져오기** — 여행 블로그 본문을 붙여넣으면 장소를 뽑아 일정화
- **이동수단별 시간** — 대중교통(ODsay)·도보·자동차(OSRM 도로거리 + 도심 속도 보정)
- **자동 저장·공유** — URL 해시 + localStorage. 링크 하나로 동행자와 공유·복원

## 외부 데이터 (모두 무료, 키는 기기에만 저장)

| 용도 | 서비스 | 키 |
|---|---|---|
| 날씨 | Open-Meteo | 불필요 |
| 지도·장소·맛집 검색·자동완성 | Kakao Maps JS | JS 키(도메인 잠금) |
| 대중교통 시간 | ODsay | 웹 키 |
| 놀거리·관광 명소(사진) | 한국관광공사 TourAPI(KorService2) | 내장(기본 키) |
| 도보·자동차 경로/거리 | OSRM 공개 데모 | 불필요 |

기본 키가 내장돼 있어 바로 동작하며, 본인 키로 바꾸려면 앱 안 설정에서 입력하면 됩니다(기기에만 저장). 키가 전부 막혀도 큐레이션/추정 폴백으로 동작합니다.

## 배포 (GitHub Pages, 0원)

1. GitHub repo `kmini0157/dongseoni`에 파일 업로드(덮어쓰기)
2. Settings → Pages → `main` / `(root)` → Save
3. `https://kmini0157.github.io/dongseoni/` 에서 1~2분 뒤 반영

코드 수정 후에는 변경된 파일만 재업로드하면 됩니다.

## 앱 스토어 (준비 완료)

Google Play(안드로이드, TWA)와 App Store(iOS, WKWebView)로 출시하기 위한 자산·설정·등록정보가 준비돼 있습니다.

- 안드로이드 절차: [`STORE_ANDROID.md`](STORE_ANDROID.md)
- iOS 절차: [`STORE_IOS.md`](STORE_IOS.md)
- 전체 핸드오프 체크리스트: [`RELEASE.md`](RELEASE.md)
- 개인정보처리방침: [`privacy.html`](privacy.html)

## 파일 구성

```
index.html              앱 본체(단일 파일)
manifest.json           PWA 매니페스트
sw.js                   서비스워커(network-first, 오프라인 캐시)
privacy.html            개인정보처리방침
icon*.png / icon*.svg   앱 아이콘(192/512/maskable/1024/180/favicon)
feature-graphic.png     Play 피처 그래픽(1024×500)
.well-known/assetlinks.json   안드로이드 TWA 도메인 인증
codemagic.yaml          iOS 클라우드 빌드 설정
_build/                 아이콘·그래픽 생성 스크립트(배포 제외)
```

> `_build/`(node_modules 포함)는 빌드 도구라 GitHub에 올릴 필요 없습니다.
