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

### ✅ Phase 2: Gemini 디자인 완전 통합 (완료: 2026-03-19)
- [x] 풀스크린 3단+사이드바 레이아웃
- [x] 테마 3종 (인디고/벚꽃/민트) + 위젯 설정 모달
- [x] 신규 위젯: DesktopOrganizer, QuotesOffWork, LunchDday, SmartTools, SettingsModal
- [x] 시간표/현재수업 비주얼 업그레이드 (블라인드, 진행률 바, 펄스 애니메이션)

---

## 현재 기능 상태 (2026-03-19 기준)

| 위젯 | ✅ 동작 | 🔧 더미/하드코딩 | ❌ 미구현 |
|------|---------|----------------|----------|
| **시계** | 시간, 날짜, 요일 | 날씨 "맑음 12°C" 고정 | 날씨 API |
| **현재 수업** | 교시 감지, 진행률 바 | — | — |
| **시간표** | 추가/삭제, 저장, 블라인드 | — | 나이스 API 자동 로드 |
| **할 일** | 추가/완료/삭제, 저장 | — | — |
| **급식+D-Day** | D-Day 계산 | 급식 메뉴 고정, D-Day 날짜 고정 | 급식 API, D-Day 편집 |
| **퇴근+명언** | 퇴근 시간 계산, 랜덤 명언 | 퇴근 시간 16:30 고정 | 퇴근 시간 설정 |
| **스마트 도구** | NEIS/클래스팅 링크 | — | 타이머, 랜덤뽑기, 미제출자, 내선번호 |
| **설정 모달** | 테마 전환, 위젯 토글 | — | 학교 설정, 교시 시간 편집 |
| **바탕화면 정리** | UI 표시만 | — | (시각적 가이드 역할이라 OK) |

---

## Phase 3: 기능 구현 (다음 작업)

### ✅ Step 1: 스마트 도구 실제 구현 (완료: 2026-03-19)
- [x] **팝업 타이머**: 원형 SVG 진행률, 5/10/15/20/30분 프리셋, 커스텀 시간, 시작/정지/리셋, Web Audio 알림음, 자동닫기
- [x] **랜덤 학생 뽑기**: 학생 수 설정(저장), 번호 순환 애니메이션, "뽑힌 학생 제외" 토글, 초기화
- [x] **미제출자 체크**: 번호 격자 클릭 토글, 항목별 제목 입력, 미제출 카운트, 전체선택/해제, 항목별 저장
- [x] **내선번호 목록**: 학교 기본 번호 프리셋, 추가/편집/삭제, 검색, 로컬 저장
- [x] SmartToolsWidget에서 각 버튼 클릭 시 모달 오픈 연동
- [x] "빠른 5분 타이머" 버튼 → 타이머 모달 5분 프리셋으로 직접 오픈

---

### ✅ Step 2: D-Day 및 급식 기능 완성 (완료: 2026-03-19)
- [x] **DdayEditModal**: D-Day 추가/삭제, 핀(메인 지정), 색상 코딩 (7일↓빨강, 30일↓주황), 로컬 저장
- [x] **MealEditModal**: 급식 메뉴 수동 입력 (줄바꿈 구분), 칼로리 입력, 날짜별 저장
- [x] **LunchDdayWidget 연동**: 스토어에서 로드, 클릭 시 모달 오픈, 빈 상태 안내

---

### ✅ Step 3: 설정 모달 확장 (완료: 2026-03-19)
- [x] **탭 UI**: 테마&위젯 | 학교정보 | 시간설정 | 즐겨찾기 (4탭)
- [x] **학교 정보**: 학교명, 학교급(초/중/고), 학년/반, 지역(17개 시도), 학생수, NEIS API키
- [x] **시간 설정**: 7교시 시작/종료 시간 편집, 퇴근 시간 설정, 기본값 초기화
- [x] **즐겨찾기**: 런처 추가/편집/삭제/순서변경, 10색 컬러 선택
- [x] **연동**: 퇴근 위젯 offWorkTime 설정값 사용, 스마트도구 런처 설정값 사용

---

### ✅ Step 4: API 연동 (완료: 2026-03-19)
- [x] **날씨 API**: wttr.in 연동, 17개 지역→영문 도시 매핑, 영문→한글+이모지 날씨명, 30분 캐시
- [x] **급식 API**: 나이스 Open API 연동, 17개 교육청 코드 매핑, 메뉴 파싱 (알레르기 제거), 자동/수동 뱃지
- [x] **Electron IPC**: main process에서 net.fetch → preload API → renderer 연동
- [x] **ClockWidget**: 실시간 날씨 (기온, 날씨, 습도)
- [x] **LunchDdayWidget**: 학교코드 설정 시 자동 fetch, 새로고침 버튼, 로딩 스피너

#### 향후 추가 가능
- 나이스 시간표 API (`/hub/misTimetable`) - 학교코드+학년/반 → 자동 시간표 로드
- 에어코리아 미세먼지 API - 현재는 날씨만 표시

---

## Phase 4: 바탕화면 파티션 실제 기능 구현

### 개요
현재 좌측 파티션은 빈 점선 영역. 이를 실제 **파일/폴더를 드래그&드롭으로 배치**하고
**더블클릭으로 열 수 있는** 파일 정리 공간으로 만든다.

### Step 1: 파일/폴더 드래그 & 드롭 수신 🔴 최우선

#### 4-1. 파티션 영역에 파일 드롭 기능
- **구현**: 윈도우 탐색기에서 파일/폴더를 파티션 영역으로 드래그&드롭
- **기술**: HTML5 `dragover` + `drop` 이벤트 → `e.dataTransfer.files`로 경로 추출
- **Electron**: `webkitGetAsEntry()` 또는 `file.path` 속성으로 전체 경로 획득
- **저장**: 경로(path) + 이름(name) + 타입(file/folder) + 아이콘 → 로컬 저장소
- **카테고리**: 어떤 파티션에 드롭했는지에 따라 카테고리 자동 분류

#### 4-2. 파티션 카테고리 구성 (설정 가능)
- **기본 4개**: 운영계획 / 진행중 업무 / 나중에 볼 파일 / 기타
- **설정 모달에서 편집**: 이름 변경, 추가/삭제, 순서 변경
- **아이콘**: 카테고리별 색상 + Folder 아이콘

### Step 2: 배치된 파일/폴더 표시 + 조작 🔴 최우선

#### 4-3. 파일/폴더 아이콘 표시
- **구현**: 각 파티션 안에 배치된 파일/폴더를 아이콘+이름으로 표시
- **디자인**: 윈도우 바탕화면 아이콘과 유사 (작은 아이콘 + 이름 텍스트)
- **아이콘 타입**: 폴더(📁), 문서(.hwp/.docx → 📄), 엑셀(.xlsx → 📊), PDF(📕), 이미지(🖼️), 기타(📎)
- **그리드 배치**: 파티션 내에서 자동 그리드 배치 (윈도우 바탕화면처럼)

#### 4-4. 더블클릭으로 파일/폴더 열기
- **구현**: Electron `shell.openPath(path)` 호출
- **IPC**: renderer → preload → main process → `shell.openPath()`
- **폴더**: 탐색기로 열림
- **파일**: 연결된 기본 프로그램으로 열림 (.hwp → 한글, .xlsx → 엑셀 등)

#### 4-5. 우클릭 컨텍스트 메뉴
- **파일/폴더에서 우클릭**: "열기 / 폴더 위치 열기 / 파티션에서 제거"
- **빈 영역에서 우클릭**: "폴더 추가 / 파일 추가 (파일 선택 대화상자)"

### Step 3: 데이터 모델 + 저장 🟡 높음

#### 4-6. 타입 정의
```typescript
interface PartitionCategory {
  id: string
  name: string          // "운영계획"
  iconColor: string     // "#3b82f6"
  order: number
}

interface PartitionItem {
  id: string
  categoryId: string    // 어떤 파티션에 속하는지
  name: string          // 파일/폴더 이름
  path: string          // 전체 경로 "D:\교무\운영계획.hwp"
  type: 'file' | 'folder'
  extension: string     // "hwp", "xlsx", "" (폴더)
  addedAt: string       // ISO 날짜
}
```

#### 4-7. 저장소
- **Store key**: `partitionCategories` (카테고리 목록)
- **Store key**: `partitionItems` (배치된 파일/폴더 목록)
- **Zustand 스토어**: `partitionStore.ts` (CRUD + 저장/로드)

### Step 4: 바탕화면 고정 모드 🟢 보통 (선택)

#### 4-8. 윈도우를 바탕화면 레벨로 내리기
- **구현**: Electron BrowserWindow를 바탕화면 아래, 아이콘 위에 배치
- **기술**: Windows API `SetWindowPos` + `HWND_BOTTOM` 또는 `shell:desktop` 기법
- **참고**: Rainmeter가 사용하는 방식
- **리스크**: Windows 업데이트에 따라 불안정할 수 있음
- **대안**: "항상 뒤에(Always on Bottom)" 모드로 타협 가능

### 필요한 IPC 추가
```
'open-path'     → shell.openPath(path)
'open-folder'   → shell.showItemInFolder(path)
'select-file'   → dialog.showOpenDialog (파일 선택)
'select-folder' → dialog.showOpenDialog (폴더 선택)
```

---

## 일정 요약 (업데이트)

---

## 일정 요약

| Phase/Step | 내용 | 상태 |
|------------|------|------|
| Phase 1~2 | 프로젝트 셋업 + 디자인 | ✅ 완료 |
| Phase 3 Step 1 | 스마트 도구 4종 | ✅ 완료 |
| Phase 3 Step 2 | D-Day + 급식 | ✅ 완료 |
| Phase 3 Step 3 | 설정 모달 4탭 | ✅ 완료 |
| Phase 3 Step 4 | 날씨/급식 API 연동 | ✅ 완료 |
| **Phase 4 Step 1** | **파일/폴더 드래그&드롭** | 🔴 다음 |
| **Phase 4 Step 2** | **아이콘 표시 + 더블클릭 열기** | 🔴 다음 |
| Phase 4 Step 3 | 데이터 저장 + 우클릭 메뉴 | 🟡 높음 |
| Phase 4 Step 4 | 바탕화면 고정 모드 | 🟢 선택 |

---

*최종 업데이트: 2026-03-19*
