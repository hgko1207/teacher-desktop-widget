---
name: commit
description: 현재 변경사항을 커밋하고 GitHub에 푸쉬. 커밋 메시지를 자동 생성하거나 사용자 지정 가능.
user-invocable: true
argument-hint: [커밋 메시지 또는 비워두면 자동 생성]
---

현재 변경사항을 커밋하고 GitHub에 푸쉬합니다.

1. `git status`로 변경 파일 확인
2. `npx tsc --noEmit`으로 타입체크 실행
3. 타입체크 통과 시:
   - $ARGUMENTS가 있으면 해당 메시지로 커밋
   - 없으면 변경사항 분석하여 커밋 메시지 자동 생성
   - 커밋 메시지에 `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>` 포함
4. `git add -A && git commit && git push` 실행
5. 결과 요약 출력

타입체크 실패 시 커밋하지 않고 에러 내용을 알려줍니다.