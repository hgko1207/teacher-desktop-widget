# 배포 가이드 (RELEASE.md)

버그 수정·기능 개선 후 **새 버전을 내보내면, 아내(및 사용자) PC의 앱이 자동으로 업데이트**됩니다.
이 문서대로만 하면 됩니다.

---

## 한 줄 요약

```powershell
# 1. 코드 고치고 → 2. 타입체크 → 3. 버전 올리고 → 4. 릴리즈
npm run typecheck
npm version patch          # 0.1.0 → 0.1.1 (package.json 버전 자동 증가 + 커밋 + 태그)
$env:GH_TOKEN = "토큰값"   # 최초 1회만 발급, 매번 이 세션에 설정
npm run release:win        # 빌드 + GitHub Releases 자동 업로드
git push --follow-tags     # 커밋·태그 푸시
```

이후 아내 PC에서 앱이 켜져 있으면 **5초 뒤 새 버전을 감지 → 자동 다운로드 → "재시작하면 적용" 알림**이 뜹니다.

---

## 사전 준비 (최초 1회만)

### 1. GitHub 리포지토리가 **public** 이어야 함
- 자동 업데이트는 사용자 PC가 **인증 없이** GitHub Releases에서 파일을 받아야 동작합니다.
- 리포가 private이면 토큰을 앱에 박아야 해서(보안상 나쁨) 권장하지 않습니다.
- 현재 설정: `hgko1207/teacher-desktop-widget` (`electron-builder.yml`의 `publish` 항목).

### 2. GitHub 토큰(GH_TOKEN) 발급
업로드(게시)할 때만 쓰는 키입니다. 사용자 PC에는 들어가지 않습니다.

1. GitHub → Settings → Developer settings → **Personal access tokens (classic)**
2. **Generate new token** → 권한(scope): `public_repo` 체크 (public 리포면 충분)
3. 생성된 토큰 문자열을 안전한 곳에 보관 (다시 안 보여줌)
4. 릴리즈할 때마다 PowerShell에서 설정:
   ```powershell
   $env:GH_TOKEN = "ghp_여기에_토큰"
   ```
   > 매 PowerShell 세션마다 다시 설정해야 합니다. 영구 등록하려면:
   > `[Environment]::SetEnvironmentVariable("GH_TOKEN", "ghp_...", "User")` (새 터미널부터 적용)

---

## 릴리즈 절차 (매번)

### 1단계 — 코드 수정 & 로컬 테스트
```powershell
npm run dev          # 개발 모드로 띄워서 직접 확인
```
> 자동 시작·자동 업데이트 기능은 **개발 모드에선 동작 안 함**(설계상). 설치본에서만 동작합니다.

### 2단계 — 타입체크 (필수)
```powershell
npm run typecheck
```
에러가 있으면 **여기서 멈추고 고칩니다.** (CLAUDE.md 규칙)

### 3단계 — 버전 올리기
`package.json`의 `version`을 올립니다. **반드시 이전보다 높아야** 업데이트가 감지됩니다.

버전 규칙 (Semantic Versioning, `major.minor.patch`):
| 종류 | 명령 | 언제 |
|------|------|------|
| **patch** | `npm version patch` | 버그 수정, 작은 변경 (0.1.0 → 0.1.1) |
| **minor** | `npm version minor` | 기능 추가 (0.1.0 → 0.2.0) |
| **major** | `npm version major` | 큰 변경/구조 개편 (0.1.0 → 1.0.0) |

`npm version`은 버전 증가 + git 커밋 + git 태그(v0.1.1)를 자동으로 만듭니다.
(작업 트리가 깨끗해야 동작 — 먼저 변경사항을 커밋해 두세요.)

> 커밋/태그 없이 버전만 올리려면: `npm version patch --no-git-tag-version`

### 4단계 — 릴리즈 (빌드 + 업로드)
```powershell
$env:GH_TOKEN = "ghp_토큰"      # 아직 안 했으면
npm run release:win
```
이 한 줄이 하는 일:
- `npm run build` (타입체크 + electron-vite 빌드)
- `electron-builder --win --publish always`
  - `TeacherDesk-<버전>-Setup.exe` (설치본) + `Portable.exe` (무설치본) 생성
  - `latest.yml` (업데이트 비교용 메타파일) 생성
  - 위 파일들을 **GitHub Releases에 자동 업로드**

### 5단계 — 푸시 & 확인
```powershell
git push --follow-tags
```
- GitHub → 리포 → **Releases** 탭에서 새 버전이 **published**(draft 아님) 상태인지 확인.
- `latest.yml`, `*-Setup.exe`, `*.blockmap` 파일이 첨부돼 있는지 확인.

---

## 사용자(아내) PC에서 벌어지는 일

1. 앱이 켜져 있으면 시작 5초 후 GitHub Releases를 확인 ([index.ts:850](src/main/index.ts#L850) `setupAutoUpdater`)
2. 새 버전 발견 → **자동 다운로드** (`autoDownload = true`)
   - "새 버전 X를 다운로드 중입니다..." 알림
3. 다운로드 완료 → **"앱을 재시작하면 새 버전이 적용됩니다"** 알림
4. 다음에 앱을 종료/재시작하면 자동 설치 (`autoInstallOnAppQuit = true`)

사용자는 따로 받거나 깔 필요 없이, **재시작 한 번**이면 끝입니다.

---

## 자주 막히는 곳 (Troubleshooting)

| 증상 | 원인 / 해결 |
|------|------------|
| 업로드 실패 (401/403) | `GH_TOKEN` 미설정 또는 권한 부족 → `public_repo` 권한으로 재발급 |
| 사용자 PC가 업데이트 못 받음 | ① 리포가 private → public으로 ② Release가 draft 상태 → published로 ③ 버전이 안 올라감(이전과 동일) |
| `latest.yml not found` | release:win이 중간에 실패 → 다시 실행, Releases에 `latest.yml` 첨부 확인 |
| 업데이트 시 SmartScreen 경고 | 코드 서명 안 함 → 보통 업데이트는 조용히 적용되지만, 처음 설치는 "추가 정보 → 실행" 필요 |
| 빌드만 하고 업로드는 안 하고 싶을 때 | `npm run build:win` (로컬에 exe만 생성, 업로드 X) |

---

## 명령어 정리

| 명령 | 용도 |
|------|------|
| `npm run dev` | 개발 모드 실행 |
| `npm run typecheck` | 타입 검사 |
| `npm run build:win` | 로컬 빌드만 (업로드 X) — 테스트 설치용 |
| `npm run release:win` | 빌드 + GitHub Releases 업로드 (= 배포) |
| `npm version patch/minor/major` | 버전 증가 + 커밋 + 태그 |
