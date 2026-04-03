# 🏯 경주 타임트래블

> **2026 관광데이터 활용 공모전 · 웹·앱 개발 부문** 데모 프로토타입  
> 한국관광공사 OpenAPI 기반 · 경주 지역 특화 관광 서비스

---

## 📌 서비스 소개

신라 천년의 유적지를 **스토리 카드**로 만나고,  
드래그 앤 드롭으로 나만의 하루 여정을 만들면  
이동 구간별 교통편 · 명소별 맛집 · 날씨 정보가 **실시간으로** 업데이트됩니다.

모바일에서는 카드 **탭**으로 시간대를 선택하고, **롱프레스**로 카드를 드래그할 수 있습니다.

---

## 🗂 디렉토리 구조

```
gyeongju_demo/
├── index.html              # 메인 진입점 (여정 만들기)
├── vercel.json             # Vercel 라우팅 설정
├── README.md
├── api/
│   └── proxy.js            # Vercel Serverless Function (CORS 프록시)
├── api-test/
│   └── index.html          # 한국관광공사 API 테스트 페이지
├── proposal/
│   └── index.html          # 서비스 제안서 페이지
├── contest/
│   └── index.html          # 공모전 안내 페이지
└── src/
    ├── css/
    │   ├── style.css        # 메인 앱 전체 스타일
    │   └── nav.css          # 플로팅 네비게이션 공통 스타일 (Pretendard 폰트)
    ├── js/
    │   ├── app.js           # 드래그앤드롭 · 터치 드래그 · 상태 관리 · UI 업데이트
    │   └── nav.js           # 플로팅 네비게이션 공통 스크립트 (모든 페이지 공유)
    └── data/
        ├── cards.js         # 경주 명소 스토리 카드 데이터
        ├── transport.js     # 이동 구간별 교통편 데이터
        └── food.js          # 명소별 맛집 데이터
```

---

## 🚀 실행 방법

별도 빌드 없이 바로 실행 가능합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/rookiejj/gyeongju_demo.git
cd gyeongju_demo

# 2. index.html을 브라우저에서 열기
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

또는 VSCode의 **Live Server** 확장을 사용하면 더 편합니다.

> **참고:** `api/proxy.js`는 Vercel Serverless Function으로, 로컬에서는 동작하지 않습니다.  
> API 테스트 페이지(`/api-test`)는 Vercel 배포 환경에서만 프록시 기능이 활성화됩니다.

---

## 🌐 Vercel 배포

`vercel.json`에 아래 라우팅이 설정되어 있어 URL 직접 접근이 가능합니다.

| URL | 연결 페이지 |
|-----|------------|
| `/` | `index.html` — 여정 만들기 |
| `/proposal` | `proposal/index.html` — 서비스 제안서 |
| `/contest` | `contest/index.html` — 공모전 안내 |
| `/api-test` | `api-test/index.html` — API 테스트 |
| `/api/proxy` | `api/proxy.js` — 관광공사 CORS 프록시 |

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📜 스토리 카드 | 8개 경주 명소 · 역사 스토리 · 시대 배경 |
| 🗓 타임라인 | 오전 / 오후 / 저녁 슬롯에 드래그 앤 드롭 배치 |
| 📱 모바일 지원 | 탭으로 시간대 선택 · 롱프레스(480ms)로 카드 드래그 재배치 |
| 🚌 구간별 교통편 | 경주역→첫 명소, 명소→명소 이동마다 버스/택시/도보 옵션 표시 |
| 🍽 명소별 맛집 | 배치된 카드 각각의 주변 맛집 자동 추천 |
| 🌤 날씨 | 현재 경주 날씨 및 준비물 안내 |
| ✓ 여정 확정 | "이렇게 정했어!" 버튼으로 최종 확정 및 요약 표시 |
| 🧭 플로팅 네비 | 모든 페이지 공통 플로팅 네비게이션 (nav.js / nav.css) |
| ⚡ API 테스트 | 한국관광공사 OpenAPI 직접 호출 테스트 (CORS 프록시 경유) |

---

## 🔭 향후 개발 계획 (실제 공모전 제출 버전)

- [x] Vercel Serverless Function CORS 프록시 구현 (`api/proxy.js`)
- [ ] 한국관광공사 OpenAPI 연동 (실시간 운영시간 · 입장료 · 혼잡도)
- [ ] 카카오맵 API 연동 (실제 이동 경로 · 대중교통 시간표)
- [ ] 날씨 API 연동 (방문 날짜 선택 시 예보 반영)
- [ ] 퀘스트 / 스탬프 투어 시스템
- [ ] 내 여정 이미지 저장 · SNS 공유
- [ ] 모바일 앱 (React Native)

---

## 🛠 기술 스택

- HTML5 / CSS3 / Vanilla JavaScript
- Web Drag and Drop API
- Touch Events API (모바일 롱프레스 드래그)
- Google Fonts (Noto Serif KR · Noto Sans KR)
- Pretendard (플로팅 네비게이션)
- Vercel (정적 호스팅 + Serverless Functions)

---

## 📄 라이선스

MIT License
