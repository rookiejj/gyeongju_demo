# 🏯 경주 타임트래블

> **2026 관광데이터 활용 공모전 · 웹·앱 개발 부문** 데모 프로토타입  
> 한국관광공사 OpenAPI 기반 · 경주 지역 특화 관광 서비스

---

## 📌 서비스 소개

신라 천년의 유적지를 **스토리 카드**로 만나고,  
드래그 앤 드롭으로 나만의 하루 여정을 만들면  
이동 구간별 교통편 · 명소별 맛집 · 날씨 정보가 **실시간으로** 업데이트됩니다.

---

## 🗂 디렉토리 구조

```
gyeongju-timetravel/
├── index.html              # 메인 진입점
├── README.md
└── src/
    ├── css/
    │   └── style.css       # 전체 스타일
    ├── js/
    │   └── app.js          # 드래그앤드롭 · 상태 관리 · UI 업데이트
    └── data/
        ├── cards.js        # 경주 명소 스토리 카드 데이터
        ├── transport.js    # 이동 구간별 교통편 데이터
        └── food.js         # 명소별 맛집 데이터
```

---

## 🚀 실행 방법

별도 빌드 없이 바로 실행 가능합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/gyeongju-timetravel.git
cd gyeongju-timetravel

# 2. index.html을 브라우저에서 열기
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

또는 VSCode의 **Live Server** 확장을 사용하면 더 편합니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📜 스토리 카드 | 8개 경주 명소 · 역사 스토리 · 시대 배경 |
| 🗓 타임라인 | 오전 / 오후 / 저녁 슬롯에 드래그 앤 드롭 배치 |
| 🚌 구간별 교통편 | 경주역→첫 명소, 명소→명소 이동마다 버스/택시/도보 옵션 표시 |
| 🍽 명소별 맛집 | 배치된 카드 각각의 주변 맛집 자동 추천 |
| 🌤 날씨 | 현재 경주 날씨 및 준비물 안내 |
| ✓ 여정 확정 | "이렇게 정했어!" 버튼으로 최종 확정 |

---

## 🔭 향후 개발 계획 (실제 공모전 제출 버전)

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
- Google Fonts (Noto Serif KR · Noto Sans KR)

---

## 📄 라이선스

MIT License
