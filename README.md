# 교사용 데스크탑 위젯 (Teacher's Desktop Widget)

교사의 일상 업무를 위한 올인원 데스크탑 위젯 애플리케이션입니다. 시간표, 급식, 학사일정, 날씨, 미세먼지, 할일 관리 등 교사에게 필요한 모든 정보를 한 화면에서 확인할 수 있습니다.

## 주요 기능

### 위젯 목록

| 위젯 | 설명 |
|------|------|
| **시계** | 현재 시간 표시 |
| **날씨 + 미세먼지** | wttr.in 기반 날씨, 에어코리아 API 기반 미세먼지(PM10/PM2.5) 실시간 |
| **현재 수업** | 현재 진행 중인 수업 정보 표시 |
| **시간표** | 컴시간(Comcigan) API 기반 주간 시간표, 수동 입력 지원 |
| **할일 관리** | 우선순위별 할일 목록, 완료 체크 기능 |
| **D-Day** | 중요 날짜 카운트다운 (수능, 개학일 등) |
| **급식** | NEIS Open API 기반 오늘의 중식 메뉴 |
| **학사일정** | NEIS Open API 기반 이번 달 학사일정 |
| **메모** | 폰 메시지 스타일 메모 위젯 |
| **명언 / 퇴근까지** | 교육 명언 또는 퇴근까지 남은 시간 표시 |
| **스마트 도구** | 타이머, 랜덤 뽑기, 미제출 관리, 학교 전화번호부, 공문 문서번호 |
| **바탕화면 파티션** | 바탕화면 파일 폴더 정리 사이드바 |

### 설정

- **테마 & 위젯**: 위젯 표시/숨김 선택, 색상 테마 변경
- **학교정보**: 학교 검색 (컴시간 + NEIS 통합), 지역/교육청 코드 자동 설정
- **시간설정**: 수업 시작/종료 시간 커스텀
- **즐겨찾기**: 자주 사용하는 링크 관리

## 화면 레이아웃

```
┌─────────────────────────────────────────────────────┐
│                    타이틀 바                          │
├─────────────┬──────────────┬──────────────┬──────────┤
│  시계       │  날씨/미세먼지 │  현재수업    │  명언    │
│  (130px)    │  (130px)      │  (130px)     │ (130px)  │
├─────────────┴──────────────┴──────────────┴──────────┤
│  시간표 (3)  │  할일+D-Day+메모 (3)  │  스마트도구+  │
│             │                       │  학사일정+급식 │
│             │                       │  (2)          │
│  (flex-1)   │  (flex-1)             │  (flex-1)     │
└─────────────┴───────────────────────┴────────────────┘
  [사이드바: 바탕화면 파티션]
```

## 기술 스택

- **Framework**: Electron 28 + React 19 + TypeScript 5
- **Build**: electron-vite + Vite 7
- **Styling**: Tailwind CSS v4 (레이아웃) + Inline Styles (디자인)
- **State Management**: Zustand 5 + electron-store (영속성)
- **Icons**: Lucide React

## 외부 API

| API | 용도 | 키 필요 여부 |
|-----|------|-------------|
| [wttr.in](https://wttr.in) | 날씨 | 불필요 |
| [에어코리아](https://www.airkorea.or.kr) | 미세먼지 | 필요 (공공데이터포털) |
| [NEIS Open API](https://open.neis.go.kr) | 급식, 학사일정 | 필요 (NEIS) |
| [컴시간 (Comcigan)](http://comci.kr) | 시간표 | 불필요 |

## 시작하기

### 요구사항

- Node.js 18+
- npm 9+

### 설치

```bash
npm install
```

### 개발 실행

```bash
npm run dev
```

### 빌드

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## API 키 설정

앱 실행 후 우측 상단 설정(⚙️) 버튼에서 API 키를 입력하세요.

### 에어코리아 API 키 발급
1. [공공데이터포털](https://www.data.go.kr) 회원가입
2. `한국환경공단_에어코리아_대기오염정보` API 신청
3. 발급된 서비스키를 설정 → 학교정보 탭에 입력

### NEIS API 키 발급
1. [NEIS Open API](https://open.neis.go.kr) 회원가입
2. API 키 발급
3. 설정 → 학교정보 탭에 입력

### 학교 설정
1. 설정 → 학교정보 탭
2. 학교명 검색 (컴시간 + NEIS 통합 검색)
3. 학교 선택 시 교육청 코드 자동 설정

## 개발 환경

```
src/
├── main/
│   ├── index.ts          # Electron 메인 프로세스, IPC 핸들러
│   ├── comcigan.ts       # 컴시간 시간표 API (직접 HTTP 구현)
│   └── store.ts          # electron-store 기본값
├── preload/
│   ├── index.ts          # IPC 브릿지
│   └── index.d.ts        # window.api 타입 정의
└── renderer/
    └── src/
        ├── App.tsx        # 메인 레이아웃
        ├── components/
        │   └── widgets/   # 위젯 컴포넌트들
        ├── stores/        # Zustand 스토어
        └── types/         # TypeScript 타입 정의
```

## 라이선스

MIT