# SkyEntry — Blueprint

## 1. 프로젝트 개요

**SkyEntry**는 스카이다이빙·패러글라이딩·윙슈트 입문자를 위한 한국어 정보 가이드 웹사이트입니다.
단일 HTML 파일(`index.html`) 기반의 순수 HTML/CSS/JS 프로젝트로, 외부 프레임워크 없이 구현되었습니다.

- **URL:** https://skydiveguide.pages.dev
- **언어:** 한국어
- **기술 스택:** HTML5, CSS3 (임베디드), Vanilla JS (임베디드)
- **폰트:** Google Fonts — Bebas Neue, Noto Sans KR, Space Mono

---

## 2. 파일 구조

```
skydiveguide/
├── index.html   # 메인 파일 (3170줄) — HTML + CSS + JS 모두 포함
├── style.css    # 빈 파일 (미사용, 스타일은 index.html <style>에 임베디드)
├── main.js      # 빈 파일 (미사용, JS는 index.html <script>에 임베디드)
├── README.md    # 간단한 설명
└── GEMINI.md    # AI 개발 가이드라인
```

---

## 3. 디자인 시스템

### 3.1 컬러 팔레트 (CSS 변수)

| 변수명 | 값 | 용도 |
|---|---|---|
| `--sky-black` | `#f4f8fe` | 페이지 배경 |
| `--sky-dark` | `#e8f0fb` | 서브 배경 |
| `--sky-mid` | `#d2e4f5` | 카드 배경 |
| `--sky-blue` | `#1565c0` | 기본 파랑 |
| `--sky-bright` | `#1976d2` | 밝은 파랑 |
| `--sky-cyan` | `#0277bd` | 강조 파랑 |
| `--sky-white` | `#1a2d42` | 기본 텍스트 |
| `--accent-orange` | `#e55c00` | 포인트 오렌지 |
| `--accent-yellow` | `#d97706` | 포인트 노랑 |
| `--text-muted` | `#4a6785` | 보조 텍스트 |
| `--glass` | `rgba(255,255,255,0.95)` | 글래스 배경 |
| `--glass-border` | `rgba(21,101,192,0.16)` | 글래스 테두리 |

### 3.2 타이포그래피

- **제목 (영문 대형):** Bebas Neue — 히어로 타이틀, 섹션 헤더, 통계 숫자
- **본문:** Noto Sans KR — 일반 텍스트, 설명, 카드 내용
- **코드/태그:** Space Mono — 섹션 태그, 고도/속도 표시

### 3.3 애니메이션

- **`@keyframes fadeUp`:** 히어로 요소 등장 (opacity 0→1, translateY 30px→0)
- **`@keyframes gridFloat`:** 히어로 그리드 부유 효과 (20s 주기)
- **`@keyframes pulse`:** 스크롤 라인 맥박 효과
- **`.animate-in` / `.visible`:** IntersectionObserver 기반 스크롤 진입 애니메이션
- **히어로 패럴랙스:** 스크롤 시 `.hero-bg` translateY(scrollY * 0.2px) 적용

---

## 4. 섹션별 구조 및 기능

### 4.1 NAV (고정 상단 네비게이션)

- `position: fixed` 상단 고정
- 로고: `SKYENTRY` (SKY + ENTRY 색 분리)
- 링크 10개: 3종목비교, 스카이다이빙, 패러글라이딩, 윙슈트, 국가별비교, 국내기관, 장비, 채널&커뮤니티, FAQ, 안전
- **모바일 햄버거 메뉴:** `toggleNav()` 함수로 드롭다운 토글
- **활성 링크 하이라이트:** 스크롤 위치에 따라 현재 섹션 링크 색상 변경 (`--sky-cyan`)

### 4.2 HERO (`#hero`)

- 전체 뷰포트 높이 (100vh)
- 배경: 라디얼 그라디언트 레이어 + 격자 패턴 오버레이
- 커스텀 커서: `.cursor` (12px 원형) + `.cursor-trail` (32px 원형 테두리) — 마우스 이동 추적
- 콘텐츠:
  - 고도/속도 배지: `// ALT: 4,000M ↑ — FREE FALL VELOCITY: 200KM/H`
  - 메인 타이틀: "하늘로의 / 첫 번째 / 도약"
  - 설명 텍스트: 사이트 소개
  - CTA 버튼 2개: "3종목 비교하기" (#compare), "자주 묻는 질문" (#faq)
  - 통계 3개: 자유낙하 속도(200+km/h), 낙하 시간(60s), 점프 고도(4,000m)
  - 스크롤 유도 인디케이터

### 4.3 3종목 비교 (`#compare`)

- 비주얼 비교 카드 3개 (`.compare-visual-grid`):
  - **스카이다이빙** 🪂: 스릴 높음, 비행 약 6분, 탠덤 77만원~, 충주 DZ
  - **패러글라이딩** 🪁 (입문 추천 배지): 비행 1시간~, 전국 100곳+ 스쿨
  - **윙슈트** 🦅: 고급자 전용, 스카이다이빙 200회+ 필요
- 각 카드에 미터 바 형태로 스릴강도/비행시간/입문난이도/비용수준 시각화
- 상세 비교 테이블 (`.compare-table`): 요소별 3종목 가로 비교

### 4.4 스카이다이빙 기초 (`#basics`)

- 아코디언 방식의 지식 카드 또는 그리드 형태
- 탠덤 점프, AFF 교육, 라이선스, 비용, 국내 DZ, 장비 기초 등

### 4.5 학습 경로 (`#learning`)

- 단계별 학습 로드맵 (`#path-section`)
- 탠덤 → AFF → 솔로 점프 → 라이선스 취득 단계 시각화

### 4.6 국가별 비교 (`#countries`)

- 주요 스카이다이빙 국가 비교 카드
- 한국, 미국, 뉴질랜드, 호주, 태국, 스위스 등

### 4.7 국내 기관 (`#institutions`)

- 국내 인증 교육기관 정보 카드
- 위치, 연락처, 교육 과정 정보

### 4.8 체력 준비 (`#fitness`)

- 스카이다이빙·패러글라이딩 입문을 위한 체력 관리 정보
- 운동 추천, 신체 조건, 건강 주의사항

### 4.9 윙슈트 (`#wingsuit`)

- 윙슈트 소개, 입문 조건, 비행 방식, 안전 주의사항

### 4.10 패러글라이딩 (`#paragliding`)

- 패러글라이딩 입문 가이드
- 교육 과정, 국내 명소, 기상 조건, 장비

### 4.11 채널&커뮤니티 (`#media`)

- 추천 유튜브 채널, 온라인 커뮤니티, SNS 계정
- 국내외 스카이다이빙/패러글라이딩 미디어 정보

### 4.12 FAQ (`#faq`)

- 아코디언 형태 FAQ (`.faq-item`)
- `toggleFaq(el)` 함수: 클릭 시 열림/닫힘, 한 번에 하나만 열림
- 나이·건강·비용·안전 관련 자주 묻는 질문들

### 4.13 장비 (`#equipment`)

- 스카이다이빙·패러글라이딩 필수 장비 소개
- 구매 vs 렌탈, 가격대, 브랜드 정보

### 4.14 안전 원칙 (`#safety`)

- 안전 수칙, 날씨 판단 기준, 비상 절차
- 고위험 스포츠 경고 및 인증 기관 이용 권장

### 4.15 FOOTER

- 로고, 태그라인, 전체 섹션 링크
- 법적 면책조항: 교육적 목적 안내
- 저작권: © 2026 SkyEntry

---

## 5. JavaScript 기능

| 기능 | 구현 위치 | 설명 |
|---|---|---|
| 커스텀 커서 | `<script>` (inline) | mousemove 이벤트 → `.cursor` / `.cursor-trail` 위치 업데이트 (trail 80ms 지연) |
| 스크롤 애니메이션 | `<script>` (inline) | `IntersectionObserver` → `.animate-in` 요소가 뷰포트 진입 시 `.visible` 클래스 추가 |
| FAQ 토글 | `toggleFaq(el)` | 클릭된 항목 열기, 나머지 모두 닫기 |
| 활성 nav 링크 | scroll 이벤트 | 현재 스크롤 위치의 섹션 ID와 일치하는 nav 링크 색상 변경 |
| 모바일 메뉴 | `toggleNav()` | `.nav-links` display 토글 (모바일 드롭다운) |
| 히어로 패럴랙스 | scroll 이벤트 | `.hero-bg` translateY 적용 (scrollY × 0.2) |

---

## 6. 반응형 디자인

- 모바일에서 햄버거 메뉴 (`.nav-toggle`) 표시
- 섹션 패딩: `100px 60px` (데스크탑) → 모바일 미디어 쿼리 조정
- 히어로 타이틀: `clamp(72px, 12vw, 160px)` 유동 폰트 사이즈
- 비교 카드 그리드: CSS Grid 기반 반응형 레이아웃

---

## 7. 접근성

- `lang="ko"` 지정
- 의미론적 HTML 태그 사용 (`<nav>`, `<section>`, `<footer>`, `<h1>`, `<h2>`)
- OG 메타 태그: og:title, og:description, og:image, og:url, og:type
- Twitter Card 메타 태그

---

## 8. 현재 변경 계획

**작업:** 코드베이스 분석 및 blueprint.md 최초 생성

### 완료 단계:
1. ✅ index.html (3170줄) 전체 구조 파악
2. ✅ CSS 디자인 시스템 분석 (컬러, 타이포그래피, 애니메이션)
3. ✅ HTML 섹션 구조 (14개 섹션) 문서화
4. ✅ JavaScript 기능 (6개) 정리
5. ✅ blueprint.md 작성 완료
