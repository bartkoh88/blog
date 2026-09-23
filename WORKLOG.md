# 작업 기록

## 2026-09-23 / Codex / 로컬 수정·검증 완료, 배포 승인 대기
- 계정: 개인 bartkoh88 / origin https://bartkoh88@github.com/bartkoh88/blog.git / bartkoh@gmail.com
- 목적·승인: 사용자 요청에 따라 블로그의 브랜드 표기를 소문자 bartkoh로 통일. 로컬 수정·검증 범위.
- 담당 파일: data/siteMetadata.js, data/authors/default.mdx, data/blog/ai-workflow-lab-start.mdx
- 한 일: 사이트 제목·헤더·작성자·소개·글 요약 표기 수정. 과거 인계 문서는 보존.
- 검증: yarn build 성공(타입·정적 생성 포함), 생성 HTML·검색·RSS 19개 파일 이전 표기 0건. ego-browser 홈·소개·글 상세 화면 title/header/footer 및 본문 확인 통과. git diff --check 통과.
- 다음 행동: 사용자 승인 후 개인 계정 Git 커밋·push 및 Vercel 운영 반영 검증.
- 미확인: 운영 반영은 별도 승인 필요.
