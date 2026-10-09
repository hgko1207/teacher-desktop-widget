# 교사용 데스크탑 위젯 (Teacher's Desktop Widget)

교사의 일상 업무를 위한 Windows 데스크탑 위젯 앱입니다. 시간표, 급식, 학사일정, 날씨, 미세먼지, 할 일을 한 화면에서 확인할 수 있습니다.

## 다운로드

[GitHub Releases](https://github.com/hgko1207/teacher-desktop-widget/releases)에서 받으세요.

- **TeacherDesk-Setup.exe** — 설치 파일 (바탕화면 바로가기 생성, 제어판에서 제거 가능)
- **TeacherDesk-Portable.exe** — 설치 없이 바로 실행 (USB 등에 휴대 가능)

새 버전이 나오면 앱이 알아서 확인하고 업데이트 알림을 띄웁니다.

## 위젯

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

설정에서 위젯 표시/숨김, 색상 테마, 수업 시작·종료 시간, 즐겨찾기 링크를 바꿀 수 있습니다.

## 처음 설정

1. 설정(⚙️) → **학교정보**에서 학교명을 검색해 고르면 교육청 코드가 자동으로 들어갑니다(컴시간 + NEIS 통합 검색).
2. 미세먼지를 보려면 에어코리아(data.go.kr) API 키를 넣으세요. 날씨·시간표·급식·학사일정은 키 없이 동작합니다.

키 발급과 입력 방법: [docs/API-KEY.md](docs/API-KEY.md)

## 개발

```bash
npm install         # Node.js 18+, npm 9+
npm run dev         # 개발 실행
npm run build:win   # 인스톨러 + 포터블 exe (dist/)
```

Electron 28 · React 19 · TypeScript 5 · electron-vite · Tailwind CSS v4 · Zustand 5 + electron-store

- 새 버전 내보내기(자동 업데이트 포함): [docs/RELEASE.md](docs/RELEASE.md)
- 화면 배치·외부 API·폴더 구조: [docs/development.md](docs/development.md)

## 라이선스

MIT
