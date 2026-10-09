# 개발 참고

화면 배치, 외부 API, 폴더 구조, 빌드 결과물 정리입니다. 새 버전 내보내기는 [RELEASE.md](RELEASE.md), API 키 발급은 [API-KEY.md](API-KEY.md)를 보세요.

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

## 빌드 결과물

```bash
# Windows (인스톨러 + 포터블)
npm run build:win
```

빌드 결과물은 `dist/` 폴더에 생성됩니다:
- `TeacherDesk-{version}-Setup.exe` — NSIS 인스톨러
- `TeacherDesk-{version}-Portable.exe` — 설치 없이 실행

## 폴더 구조

```
src/
├── main/
│   ├── index.ts          # Electron 메인 프로세스, IPC 핸들러
│   ├── comcigan.ts       # 컴시간 시간표 API (직접 HTTP 구현)
│   ├── windowPin.ts      # 바탕화면 고정 모드 (koffi + Windows API)
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
