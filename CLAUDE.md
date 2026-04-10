# Teacher's Desk - CLAUDE.md

교사용 윈도우 데스크탑 위젯. 아내(교사)를 위해 제작.

---

## 프로젝트 개요

- **프로젝트명**: Teacher's Desk
- **기술 스택**: Electron + React + TypeScript + Tailwind CSS + Zustand + lucide-react
- **빌드 도구**: electron-vite + electron-builder
- **플랫폼**: Windows 전용

---

## 디렉토리 구조

```
src/
  main/          # Electron 메인 프로세스 (Node.js)
    index.ts     # 앱 진입점, BrowserWindow 생성, IPC 핸들러
    store.ts     # electron-store (로컬 데이터 저장)
    windowPin.ts # 바탕화면 고정 모드 (koffi + Windows API)
    comcigan.ts  # 컴시간 시간표 파싱
  preload/
    index.ts     # contextBridge - renderer ↔ main IPC 브릿지
    index.d.ts   # preload API 타입 선언
  renderer/src/
    App.tsx              # 루트 컴포넌트, 레이아웃 (3단+사이드바)
    types/index.ts       # 전체 타입 정의 (StoreSchema 포함)
    stores/              # Zustand 스토어
      settingsStore.ts   # 앱 설정 (테마, 학교정보, 위젯 토글 등)
      timetableStore.ts  # 시간표 데이터
      todoStore.ts       # 할 일 목록
      partitionStore.ts  # 파일 파티션 (드래그&드롭 파일 관리)
    hooks/
      useCurrentTime.ts  # 현재 시간 (1초 갱신)
      useCurrentPeriod.ts # 현재 교시 감지
    config/
      themes.ts          # 테마 3종 (인디고/벚꽃/민트)
    utils/
      fileIcons.ts       # 파일 확장자별 아이콘
    components/          # 위젯 컴포넌트들 (위젯별 폴더)
```

---

## 핵심 규칙

### TypeScript
- `any`, `unknown` 사용 금지 - 구체적 타입 필수
- 타입 단언(`as`) 최소화, 타입 가드 우선 사용
- 새로운 타입은 반드시 `src/renderer/src/types/index.ts`에 추가

### 타입 체크
- 작업 완료 시마다 `npm run typecheck` 실행
- 새로운 타입 에러를 만들지 않음

### 코드 품질
- 사용하지 않는 import/변수 금지
- `console.log` 디버깅 코드 커밋 금지
- 매직 넘버 대신 상수 사용

### 프로젝트 진행
- 작업 완료 시 `plan.md` 해당 항목 완료로 표시
- 에러 발생 시 즉시 수정 후 진행

### 커밋 & 푸시
- "커밋 푸시해줘" 요청 시 확인 없이 자동으로 진행
- 타입체크 통과 → `git add -A && git commit && git push` 자동 실행
- 타입체크 실패 시에만 에러 내용 보고 후 중단

---

## 주요 명령어

```bash
npm run dev          # 개발 서버 (Electron + Vite HMR)
npm run typecheck    # 타입 체크 (node + web)
npm run build        # 프로덕션 빌드 (typecheck 포함)
npm run build:win    # Windows 인스톨러 (.exe)
npm run release:win  # GitHub Releases 배포 (자동 업데이트)
```

---

## 아키텍처

### IPC 패턴
```
renderer → preload(contextBridge) → main process
```
- API 호출(날씨, NEIS, 에어코리아)은 메인 프로세스에서 `net.fetch`로 처리
- renderer는 직접 외부 API 호출 불가 → preload API 경유

### 데이터 저장
- `electron-store` 기반 로컬 JSON 저장
- 스키마: `src/renderer/src/types/index.ts`의 `StoreSchema`
- 저장/로드: IPC `load-store` / `save-store` 채널

### 위젯 토글
- `settingsStore.ts`의 `visibleWidgets: Record<WidgetKey, boolean>`로 관리
- `WidgetKey` 타입: `src/renderer/src/types/index.ts`에 정의

---

## 현재 구현된 기능

| 위젯/기능 | 상태 |
|----------|------|
| 시계 + 날씨 (wttr.in API) | ✅ |
| 현재 수업 (교시 감지, 진행률 바) | ✅ |
| 주간 시간표 (수동 입력, 컴시간 자동) | ✅ |
| 할 일 목록 | ✅ |
| 급식 (NEIS API + 수동 입력) | ✅ |
| D-Day 카운트다운 | ✅ |
| 메모 (핸드폰 스타일, 목록+편집) | ✅ |
| 학사 일정 (NEIS API) | ✅ |
| 미세먼지 (에어코리아 API) | ✅ |
| 스마트 도구 (타이머, 랜덤뽑기, 미제출자, 내선번호) | ✅ |
| 바탕화면 파티션 (드래그&드롭 파일 정리) | ✅ |
| 설정 모달 (테마, 학교정보, 시간, 즐겨찾기) | ✅ |
| 바탕화면 고정 모드 (koffi + Windows API) | ✅ |
| GitHub Releases 자동 업데이트 | ✅ |
| 나이스 시간표 API | 🔵 보류 |

---

## 외부 API

| API | 용도 | 키 필요 |
|-----|------|---------|
| wttr.in | 날씨 | 불필요 |
| NEIS Open API | 급식, 학사일정 | 필요 (`neisApiKey`) |
| 에어코리아 | 미세먼지 | 필요 (`airApiKey`) |
| 컴시간 | 시간표 자동 로드 | 불필요 |

---

## 테마

`src/renderer/src/config/themes.ts`에 3종 정의:
- `indigo` - 인디고 (기본)
- `pink` - 벚꽃
- `teal` - 민트
