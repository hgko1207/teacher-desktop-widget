# 교사용 윈도우 데스크탑 위젯 - 개발 플랜

> 프로젝트명: **Teacher's Desk**
> 시작일: 2026-03-19
> 레퍼런스: [@kimju.zip 릴스](https://www.instagram.com/reel/DVqGsA-CYSP/) + [Gemini 디자인](https://gemini.google.com/share/4dfc5de5b3f1)
> 기술 스택: **Electron + React + TypeScript + Tailwind CSS + lucide-react**

---

## 완료된 작업

### ✅ 리서치 & 기획 (2026-03-19)
- [x] 교사 업무 환경 조사, 레퍼런스 릴스 분석, 기술 스택 비교
- [x] 나이스 Open API 엔드포인트 조사, 경쟁 제품 분석
- [x] research.md 작성 완료

### ✅ Phase 1: 프로젝트 셋업 & 기본 위젯 (2026-03-19)
- [x] Electron + electron-vite + React + TypeScript + Tailwind CSS 셋업
- [x] 메인 프로세스 (프레임리스 윈도우, 시스템 트레이, IPC)
- [x] 기본 위젯 7종 (시계, 시간표, 현재수업, 할일, D-Day, 메모, 급식)
- [x] Zustand 스토어, 커스텀 훅, lucide-react 아이콘 적용

---

## 다음 작업 (구현 예정)

### Phase 2: Gemini 디자인 완전 통합 ⭐ (최우선)

> 제미니에서 받은 최종 디자인을 Electron 앱에 완전히 적용.
> 현재 코드를 제미니 코드 구조로 전면 교체.

#### 2-1. 레이아웃 전면 교체 (핵심)
- **구현**: 제미니의 풀스크린 3단 + 사이드바 레이아웃 적용
- **구조**:
  ```
  ┌─────────────────────────────────────────────────────────┐
  │ [● Teacher's Desk]                    [⚙ 위젯 편집 및 테마] │
  ├──────┬──────────────────────────────────────────────────┤
  │      │  ┌──────────────┐ ┌────────┐ ┌──────┬──────┐    │
  │ 바탕  │  │ 시계 + 날씨   │ │현재수업 │ │퇴근   │명언   │    │
  │ 화면  │  │ (7열)        │ │(2열)   │ │타이머 │      │    │
  │ 정리  │  └──────────────┘ └────────┘ └──────┴──────┘    │
  │ 구역  │  ┌────────────┐ ┌──────┐ ┌────┐ ┌────────┐    │
  │      │  │ 주간 시간표  │ │할 일  │ │급식│ │즐겨찾기│    │
  │(w-72)│  │ (6열)       │ │(2열) │ │D-  │ │런처   │    │
  │      │  │             │ │      │ │Day │ │스마트  │    │
  │      │  │             │ │      │ │(2열)│ │도구   │    │
  │      │  └────────────┘ └──────┘ └────┘ │(2열)  │    │
  │      │                                  └────────┘    │
  └──────┴──────────────────────────────────────────────────┘
  ```
- **기술**: CSS Grid 12열 + flexbox
- **배경**: `bg-gradient-to-br from-gray-100 via-slate-50 to-gray-200`
- **카드**: `bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/60`
- **우선순위**: 🔴 최우선

#### 2-2. 바탕화면 파티션 사이드바 (좌측)
- **구현**: 윈도우 바탕화면 아이콘 정리용 점선 테두리 영역
- **영역**: "진행중 업무", "나중에 볼 파일", "2026학년도 우리반"
- **디자인**: `border-2 border-dashed border-gray-300/60 bg-white/20 backdrop-blur-sm rounded-3xl`
- **폴더 아이콘**: lucide-react `Folder` + 색상 코드 (파랑/초록/주황)
- **너비**: `w-72 xl:w-80 flex-shrink-0`
- **우선순위**: 🟡 높음

#### 2-3. 테마 시스템
- **구현**: 3가지 테마 색상 전환 (위젯 설정 모달에서 선택)
- **테마 정의**:
  ```typescript
  interface ThemeStyle {
    name: string       // '차분한 인디고'
    primary: string    // 'text-indigo-600' (텍스트)
    bg: string         // 'bg-indigo-50/80' (배경)
    accent: string     // 'bg-indigo-500' (강조, 진행률 바, 현재 교시)
    border: string     // 'border-indigo-200/50'
    hover: string      // 'hover:bg-indigo-100'
  }
  ```
- **3종**: 인디고(기본), 벚꽃(핑크), 민트(틸)
- **적용 범위**: 현재 수업 위젯, 시간표 현재교시, 급식 위젯, 할일 아이콘, 스마트도구
- **저장**: Zustand + 로컬 저장소
- **우선순위**: 🟡 높음

#### 2-4. 위젯 설정 모달
- **구현**: 모달 다이얼로그 (위젯 편집 및 테마 버튼 클릭 시)
- **기능**:
  - 테마 컬러 선택 (3종 원형 버튼)
  - 위젯별 켜기/끄기 토글 (ToggleLeft/ToggleRight 아이콘)
  - 토글 대상: 바탕화면 파티션, 시계/날씨, 현재수업, 퇴근타이머/명언, 시간표, 할일, 급식/D-Day, 스마트도구
- **디자인**: `bg-white rounded-3xl shadow-2xl max-w-md`, 헤더/바디/푸터 3단 구조
- **상태**: `visibleWidgets: Record<WidgetKey, boolean>` (Zustand)
- **우선순위**: 🟡 높음

#### 2-5. 현재 수업 위젯 업그레이드
- **구현**:
  - 좌측 악센트 바 (`w-2.5 h-full accent color`)
  - 진행률 바 + **펄스 애니메이션** (`animate-pulse` 오버레이)
  - "종료까지 N분 남음" 뱃지 (배경 흰색, 그림자)
  - 테마색 연동
- **지나간 교시**: `bg-gray-200/50 text-gray-400/60` (회색 블라인드)
- **현재 교시**: `accent + text-white + shadow-lg + scale-105 + ring-4 ring-white`
- **우선순위**: 🔴 최우선

#### 2-6. 퇴근 타이머 + 오늘의 명언 위젯 (신규)
- **구현**: 2열 가로 배치 (퇴근타이머 | 명언)
- **퇴근 타이머**: 16:30 기준 남은 시간 계산, Coffee 아이콘, "행복한 퇴근까지"
- **명언**: Heart 아이콘 + 랜덤 교사 힐링 문구 (매일 교체)
- **디자인**: 각각 `bg-white/70 rounded-3xl`
- **우선순위**: 🟢 보통

#### 2-7. 급식 + D-Day 위젯 통합
- **구현**: 세로 2단 카드 (D-Day 위 + 급식 아래)
- **D-Day**: "여름방학식 D-129" 큰 폰트, 그라데이션 배경
- **급식**: 테마색 배경 + Utensils 워터마크 아이콘 (size=80, opacity-5)
- **칼로리**: 우측 상단 뱃지
- **우선순위**: 🟡 높음

#### 2-8. 스마트 도구 위젯 (신규/업그레이드)
- **구현**: 2단 구성 (즐겨찾기 런처 + 스마트 도구)
- **즐겨찾기 런처**: NEIS(파랑), 업무포털(틸), 클래스팅(노랑) 원형 아이콘
  - hover시 `-translate-y-1` 떠오르는 효과
- **스마트 도구**: 2x2 그리드
  - 타이머 (orange-100), 랜덤뽑기 (purple-100), 미제출자 (red-100), 내선번호 (green-100)
- **빠른 5분 타이머**: 하단 테마색 바, 원클릭 시작
- **우선순위**: 🟡 높음

#### 2-9. 시간표 비주얼 업그레이드
- **구현**:
  - 오늘 요일 헤더: `bg-gray-800 text-white rounded-xl shadow-md` (진한 강조)
  - 지나간 교시: 회색 블라인드 처리 (`bg-gray-200/50 text-gray-400/60`)
  - 현재 교시: 테마 accent + 흰 텍스트 + `scale-105 + ring-4 ring-white + shadow-lg`
  - 빈 셀: `bg-gray-100/50` (매우 연한 회색)
  - 수업 셀: 과목별 파스텔 색상 유지
- **우선순위**: 🔴 최우선

---

### Phase 3: API 연동 (Phase 2 이후)

#### 3-1. 나이스 급식 API 연동
- **API**: `/hub/mealServiceDietInfo`
- **구현**: 학교 코드 설정 → 오늘 급식 자동 로드 → 캐시
- **우선순위**: 🟡 높음

#### 3-2. 기상청 날씨 + 에어코리아 미세먼지 API
- **구현**: 지역 설정 → 현재 온도/날씨/미세먼지 자동 로드
- **우선순위**: 🟡 높음

#### 3-3. 나이스 시간표 API 연동
- **API**: `/hub/misTimetable` 등
- **구현**: 학교 검색 → 자동 시간표 로드
- **우선순위**: 🟢 보통

#### 3-4. 나이스 학사일정 API
- **API**: `/hub/SchoolSchedule`
- **우선순위**: 🟢 보통

---

### Phase 4: 고도화

#### 4-1. 학교 정보 설정 (온보딩)
- 학교 검색/선택, 학년/반, 지역, 나이스 API 키
- 교시별 시간 커스터마이징

#### 4-2. 스마트 도구 실제 구현
- 팝업 타이머 (전체화면 카운트다운)
- 랜덤 학생 뽑기 (학생 수 설정, 중복 제외)
- 미제출자 체크 (번호 클릭 → 음영 처리)
- 내선번호 목록 (편집 가능)

#### 4-3. 시스템 트레이 & 자동 시작
#### 4-4. 알림 시스템 (수업 시작 전, 할일 마감)

---

## 기술 아키텍처 (현재 구조)

```
desktop-widget/
├── src/
│   ├── main/
│   │   ├── index.ts           # Electron 메인 (윈도우, 트레이, IPC)
│   │   └── store.ts           # JSON 파일 기반 로컬 저장소
│   ├── preload/
│   │   ├── index.ts           # IPC API 노출
│   │   └── index.d.ts         # 타입 정의
│   └── renderer/src/
│       ├── App.tsx             # 메인 레이아웃 (3단 그리드)
│       ├── main.tsx            # React 엔트리
│       ├── assets/main.css     # Tailwind + 글로벌 스타일
│       ├── types/index.ts      # 공통 타입
│       ├── hooks/
│       │   ├── useCurrentTime.ts
│       │   └── useCurrentPeriod.ts
│       ├── stores/
│       │   ├── settingsStore.ts     # 앱 설정 + 테마
│       │   ├── timetableStore.ts    # 시간표 데이터
│       │   └── todoStore.ts         # 할 일 데이터
│       └── components/
│           ├── layout/
│           │   └── TitleBar.tsx      # 커스텀 타이틀바
│           └── widgets/
│               ├── ClockWidget.tsx           # 시계 + 날씨
│               ├── CurrentClassWidget.tsx    # 현재 수업 + 타이머
│               ├── TimetableWidget.tsx       # 주간 시간표
│               ├── TodoWidget.tsx            # 할 일
│               ├── DdayWidget.tsx            # D-Day
│               ├── MemoWidget.tsx            # 메모
│               ├── MealWidget.tsx            # 급식
│               ├── ToolsWidget.tsx           # 학급 도구
│               ├── DesktopOrganizer.tsx      # 바탕화면 파티션 (신규)
│               ├── QuotesOffWorkWidget.tsx   # 퇴근타이머+명언 (신규)
│               └── SettingsModal.tsx         # 위젯 설정 모달 (신규)
├── plan.md
├── research.md
├── .claude/skills/             # Claude 스킬 (plan, dev, research, simplify)
└── package.json
```

### 핵심 타입 (추가/변경)

```typescript
// 테마
type ThemeKey = 'indigo' | 'pink' | 'teal'

interface ThemeStyle {
  name: string
  primary: string    // text-*
  bg: string         // bg-*
  accent: string     // bg-* (solid)
  border: string     // border-*
  hover: string      // hover:bg-*
}

// 위젯 표시 상태
type WidgetKey = 'organizer' | 'clockWeather' | 'currentClass' | 'quotesOffWork'
  | 'timetable' | 'todo' | 'lunchDday' | 'smartTools'

interface WidgetVisibility extends Record<WidgetKey, boolean> {}

// 설정 (테마 추가)
interface AppSettings {
  // ... 기존 필드
  themeKey: ThemeKey
  visibleWidgets: WidgetVisibility
  offWorkTime: string  // "16:30"
}
```

---

## 일정 요약

| Phase | 내용 | 우선순위 |
|-------|------|---------|
| **Phase 2** | Gemini 디자인 완전 통합 (레이아웃+테마+신규위젯+설정모달) | 🔴 최우선 |
| **Phase 3** | 나이스/날씨 API 연동 | 🟡 높음 |
| **Phase 4** | 스마트도구 실구현, 설정, 알림 | 🟢 보통 |

---

*최종 업데이트: 2026-03-19*
