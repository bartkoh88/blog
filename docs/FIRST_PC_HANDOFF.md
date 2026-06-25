# Bartkoh Blog First PC Handoff

작성일: 2026-06-26

이 문서는 `blog.bartkoh.com` 프로젝트를 첫째 컴퓨터(X1/주 작업 PC)에서 이어받기 위한 인수인계 가이드입니다.

## 결론

이 프로젝트는 특정 컴퓨터에 묶어둘 필요가 없습니다. 첫째 컴퓨터로 옮겨서 운영하는 것이 맞습니다.

이유:

- 블로그 소스는 GitHub `bartkoh88/blog`에 있음
- 배포는 Vercel `bartkoh-7848s-projects/blog`에서 자동 진행
- 글 저장소는 Supabase `bartkoh` 프로젝트
- Vercel Cron은 클라우드에서 실행되므로 로컬 컴퓨터 전원과 무관
- 로컬에만 남아 있던 것은 실험용 자동화 코드와 작업 맥락뿐임

## 계정 원칙

반드시 지킬 것:

- 블로그 운영은 `bartkoh88`, `bartkoh-7848s-projects`, Supabase `bartkoh` 기준으로 진행한다.
- 이 문서와 프로젝트는 `bartkoh` 계열만 기준으로 본다.
- API 키, Supabase service role key, Vercel secret은 Git에 절대 커밋하지 않는다.

## 현재 운영 중인 것

### 라이브 사이트

- URL: https://blog.bartkoh.com
- 정적 MDX 글: `/blog`
- Supabase 동적 글: `/cloud-blog`

### GitHub

- 블로그 repo: `https://github.com/bartkoh88/blog.git`
- 최신 주요 커밋:
  - `e12193d feat: add optional LLM article generation`
  - `87b3d1c feat: improve cloud article quality engine`
  - `bf2942d docs: document cloud publishing flow`

### Vercel

- 프로젝트: `bartkoh-7848s-projects/blog`
- Production domain: `blog.bartkoh.com`
- Cron 설정: `vercel.json`
- Cron route: `/api/cron/generate`
- 실행 시각: `21:00 UTC`, 한국 시간 `06:00 KST`

필요한 Production 환경변수:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `OPENAI_API_KEY` 또는 `CONTENT_LLM_API_KEY`는 아직 넣지 않았음

중요:

- 현재 LLM API 키가 없으므로 진짜 고품질 자동 글 생성은 아직 불완전하다.
- LLM API 없이 가능한 것은 구조화된 초안/템플릿 생성 수준이다.
- 돈 되는 품질의 글을 자동 생성하려면 OpenAI 또는 OpenAI 호환 LLM API가 필요하다.

## 진행한 작업 내역 상세

### 1. 블로그 방향 결정

처음에는 WordPress, WordPress.com, Hostinger, Vercel/Supabase, 오픈소스 블로그 엔진을 비교했다.

결론:

- 빠르게 무료 또는 저비용으로 시작하려면 Vercel + GitHub 기반 블로그가 가장 적합하다.
- WordPress는 관리 화면과 플러그인은 좋지만, 호스팅/보안/플러그인 관리 부담이 있다.
- Supabase는 글/키워드/품질검사/발행 상태 저장소로 쓰는 것이 맞다.
- `blog.bartkoh.com` 서브도메인으로 운영하기로 했다.

### 2. GitHub repo 생성과 Vercel 배포

GitHub에서 `bartkoh88/blog` repo를 만들고, Vercel에서 `blog` 프로젝트로 import했다.

Vercel 프로젝트:

```text
bartkoh-7848s-projects/blog
```

초기 배포 후 Vercel 기본 도메인이 생성되었고, 이후 Cafe24 DNS에서 `blog.bartkoh.com` CNAME을 추가해 custom domain 연결을 완료했다.

확인된 라이브 URL:

```text
https://blog.bartkoh.com
```

### 3. 블로그 스타터 선택 및 커스터마이징

기반 스타터:

```text
timlrx/tailwind-nextjs-starter-blog
```

작업 당시 로컬 위치:

```text
C:\dev\bartkoh-blog
```

주요 커스터마이징:

- 사이트명: `AI Workflow Lab`
- 설명: AI tools, workflow automation, practical software guides for solo operators
- 작성자: `Bart Koh`
- 기존 샘플 글 제거
- 첫 글 `AI Workflow Lab을 시작합니다` 추가
- newsletter route 관련 빌드 문제 회피
- `bartkoh88/blog` remote로 변경
- Vercel 자동 배포 확인

초기 주요 커밋:

```text
25d9559 feat: customize AI Workflow Lab blog
```

### 4. 도메인 연결

Vercel Domains에서 `blog.bartkoh.com`을 추가했다.

Cafe24 DNS에서 CNAME을 추가했고, 이후 Vercel에서 `Valid Configuration` 상태가 확인됐다.

브라우저에서 다음 URL이 정상 표시됨:

```text
https://blog.bartkoh.com
```

### 5. 폰트와 디자인 개선

초기 블로그 폰트가 어색하다는 피드백이 있어 다음을 수정했다.

- `Space Grotesk` 중심에서 `Geist + Noto Sans KR` 조합으로 변경
- 한글 가독성 개선
- 과한 핑크 계열 primary color를 차분한 cyan/blue 계열로 조정
- 헤더 로고 텍스트 weight와 tracking 조정
- 메인 H1 weight 완화
- 태그 색상 조정

관련 커밋:

```text
5ba6a33 feat: add generated posts and refine typography
```

### 6. 로컬 자동화 프로젝트 생성

별도 로컬 자동화 프로젝트를 만들었다.

위치:

```text
C:\dev\ai-content-revenue
```

목적:

- 키워드 CSV ingest
- 키워드 점수화
- 콘텐츠 브리프 생성
- 글 초안 생성
- 품질 검사
- 리포트 생성
- MDX export
- WordPress draft push 옵션
- Supabase sync

주요 명령:

```powershell
cd C:\dev\ai-content-revenue
python -m app run-pipeline --keywords-file data/keywords.sample.csv --wordpress-dry-run
python -m app export-mdx --target C:\dev\bartkoh-blog\data\blog
python -m app sync-supabase
python -m app publish-blog --target C:\dev\bartkoh-blog\data\blog --wordpress-dry-run
```

테스트:

```text
12 passed
```

주의:

- 이 프로젝트는 아직 `bartkoh88` 계열 별도 GitHub repo에 올리지 않았다.
- 첫째 컴퓨터에서 계속 쓸 거면 `bartkoh88/ai-content-revenue` private repo로 분리하는 것이 좋다.

### 7. MDX 자동 생성 글 추가

로컬 자동화 프로젝트에서 승인된 글을 MDX로 export해 블로그에 넣었다.

생성된 글:

- `chatgpt-업무-자동화-프롬프트-실전-가이드.mdx`
- `notion-ai-자동화-템플릿-실전-가이드.mdx`
- `zapier-대체-자동화-툴-실전-가이드.mdx`

처음에는 Contentlayer가 YAML frontmatter를 파싱하지 못했다.

문제:

- `tags`와 `authors`를 double quote block list로 생성했을 때 Contentlayer가 `YAMLParseError`를 냈다.

해결:

- frontmatter를 단순 YAML 형식으로 변경
- 예:

```yaml
tags:
  - ai-tools
  - workflow-automation
  - productivity
authors:
  - default
```

검증:

```text
Generated 6 documents in .contentlayer
```

### 8. Supabase 실제 연결

Supabase 로그인은 bartkoh 계열 GitHub 계정으로 진행했다.

확인된 계정/조직:

```text
bartkoh88 / bartkoh@gmail.com
bartkoh-7848's projects
```

사용 프로젝트:

```text
project name: bartkoh
project ref: fhtzcszkfbanstyfvdau
project URL: https://fhtzcszkfbanstyfvdau.supabase.co
```

Supabase SQL Editor에서 다음 테이블을 만들었다.

- `keywords`
- `content_briefs`
- `articles`
- `affiliate_programs`
- `article_affiliate_links`
- `quality_checks`
- `wp_posts`
- `performance_snapshots`

RLS 경고가 떴고, `Run and enable RLS`를 선택했다.

이후 local automation 결과를 Supabase로 sync했다.

초기 sync 결과:

```text
keywords: 4
content_briefs: 3
articles: 3
quality_checks: 3
wp_posts: 0
performance_snapshots: 0
```

SQL Editor에서 count 쿼리로 실제 저장을 확인했다.

### 9. Vercel 환경변수 설정

Vercel CLI 로그인을 bartkoh 계정으로 진행했다.

확인:

```text
whoami: bartkoh-7848
linked project: bartkoh-7848s-projects/blog
```

Vercel Production env에 추가한 값:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
```

중요:

- 처음에는 Supabase의 새 `sb_secret_...` 키를 넣었으나 REST 호출에서 401이 발생했다.
- 이후 Supabase `Legacy anon, service_role API keys`의 `service_role` JWT로 교체했다.
- 교체 후 `/cloud-blog` 500 문제가 해결됐다.

### 10. Vercel Cron 기반 클라우드 생성 구조 추가

로컬 컴퓨터가 꺼지면 자동 생성이 멈춘다는 문제가 있어, Vercel Cron 기반 구조를 추가했다.

추가 파일:

```text
lib/supabaseContent.ts
app/api/cron/generate/route.ts
app/cloud-blog/page.tsx
app/cloud-blog/[slug]/page.tsx
vercel.json
```

기능:

- `/api/cron/generate`가 Supabase에 글 생성
- `CRON_SECRET` bearer token 없이는 401 반환
- `/cloud-blog`가 Supabase의 `approved` 글을 동적으로 읽음
- `/cloud-blog/[slug]`가 Supabase 글 상세 표시
- `vercel.json`에서 매일 06:00 KST에 Cron 실행

관련 커밋:

```text
e7b2b7f feat: add cloud article generation
bf2942d docs: document cloud publishing flow
```

### 11. 클라우드 생성 검증

수동 Cron 호출을 위해 `CRON_SECRET`을 새로 생성하고 Vercel env에 넣은 뒤 재배포했다.

수동 호출:

```powershell
Invoke-WebRequest -Uri "https://blog.bartkoh.com/api/cron/generate/" -Headers $headers -UseBasicParsing
```

결과:

```text
CRON_STATUS=200
```

Supabase에 새 글이 생성됐고 `/cloud-blog`에서 보이는 것을 확인했다.

검증:

- `/cloud-blog/` 응답 200
- 상세 글 URL 응답 200
- UTF-8 한글 정상 확인

### 12. 품질 엔진 개선 시도

사용자가 “AI가 만든 티가 안 나는 양질의 글”이 필요하다고 지적했다.

이에 따라 `lib/supabaseContent.ts`를 단순 짧은 템플릿에서 다음 구조로 개선했다.

포함 섹션:

- 검색 의도
- 실제 독자 문제
- 추천 실행 순서
- 도구 선택 기준
- 실패하기 쉬운 패턴
- 체크리스트
- FAQ
- 수익화 관점 CTA

또한 `quality_checks`에 `cloud_editorial_quality` 결과를 기록하도록 했다.

관련 커밋:

```text
87b3d1c feat: improve cloud article quality engine
```

단, 이 시점에서 중요한 결론이 나왔다.

### 13. LLM API 없이는 고품질 자동 생성 불가

사용자가 정확히 지적했다.

결론:

- LLM API 없이 가능한 것은 구조화된 초안/템플릿 생성뿐이다.
- 사람이 쓴 것 같은 고품질 글, 검색 의도별 자연스러운 글, 경쟁 글 대비 우위가 있는 글은 LLM API 없이 어렵다.
- 현재 시스템은 “고품질 글을 만들기 위한 파이프라인 뼈대”로 봐야 한다.

그래서 선택적으로 LLM API를 쓰는 구조를 추가했다.

추가된 env:

```text
OPENAI_API_KEY
OPENAI_MODEL
CONTENT_LLM_API_KEY
CONTENT_LLM_BASE_URL
CONTENT_LLM_MODEL
```

동작:

- `CONTENT_LLM_API_KEY` 또는 `OPENAI_API_KEY`가 있으면 chat completions API 호출
- 없으면 fallback 템플릿 생성

관련 커밋:

```text
e12193d feat: add optional LLM article generation
```

중요:

- 아직 Vercel에 `OPENAI_API_KEY`는 넣지 않았다.
- 로컬 환경변수에도 `OPENAI_API_KEY`는 없었다.
- 따라서 현재 production은 fallback 구조 기반이다.

### 14. 핸드오프 파일 위치 문제 해결

처음에는 인수인계 파일을 `docs/FIRST_PC_HANDOFF.md`에만 올렸다.

문제:

- 첫째 컴퓨터나 다른 에이전트가 `bartkoh-blog` 폴더 자체를 모르면 `docs` 안 파일을 발견하기 어렵다.

해결:

- repo 루트에도 `FIRST_PC_HANDOFF.md`를 추가했다.
- 이제 `bartkoh88/blog`를 clone하고 `dir`만 해도 보인다.

관련 커밋:

```text
74b41fd docs: add first PC handoff guide
7354c5e docs: expose first PC handoff at repo root
```

현재 위치:

```text
FIRST_PC_HANDOFF.md
docs/FIRST_PC_HANDOFF.md
```

### Supabase

- 조직: `bartkoh-7848's projects`
- 프로젝트명: `bartkoh`
- Project URL: `https://fhtzcszkfbanstyfvdau.supabase.co`
- 생성된 주요 테이블:
  - `keywords`
  - `content_briefs`
  - `articles`
  - `quality_checks`
  - `wp_posts`
  - `performance_snapshots`

## 첫째 컴퓨터에서 받을 것

### 1. 블로그 소스 클론

```powershell
cd C:\dev
git clone https://github.com/bartkoh88/blog.git bartkoh-blog
cd C:\dev\bartkoh-blog
corepack enable
corepack yarn install
corepack yarn build
```

### 2. Vercel 프로젝트 연결

```powershell
cd C:\dev\bartkoh-blog
npx vercel login
npx vercel link --yes --project blog
npx vercel env ls
```

확인해야 할 대상:

- 로그인 계정: `bartkoh-7848`
- 링크 대상: `bartkoh-7848s-projects/blog`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`가 Production에 있어야 함

### 3. Supabase 확인

Supabase 대시보드에서 다음을 확인한다.

- 조직: `bartkoh-7848's projects`
- 프로젝트: `bartkoh`
- URL: `https://fhtzcszkfbanstyfvdau.supabase.co`
- Table Editor에서 `articles`, `keywords`, `quality_checks`가 있는지 확인

### 4. 로컬 자동화 코드

별도 로컬 자동화 코드 위치:

```text
C:\dev\ai-content-revenue
```

아직 별도 GitHub repo로 올리지 않았다. 첫째 컴퓨터에서 이어가려면 둘 중 하나를 선택한다.

추천:

```text
bartkoh88/ai-content-revenue
```

를 private repo로 만들고, `C:\dev\ai-content-revenue` 내용을 올린 뒤 첫째 컴퓨터에서 clone한다.

주의:

- 이 자동화 코드는 로컬 실험/백업용이다.
- 실제 운영은 Vercel Cron + Supabase 중심으로 옮기는 것이 맞다.

## 현재 가장 중요한 미완료 작업

### 1. LLM API 연결

현재 `OPENAI_API_KEY` 또는 `CONTENT_LLM_API_KEY`가 Vercel에 없다.

키를 넣으면 `lib/supabaseContent.ts`의 `generateLlmBody()`가 OpenAI 호환 chat completions API를 호출한다.

권장 Vercel 환경변수:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

또는 OpenAI 호환 API를 쓸 경우:

```text
CONTENT_LLM_API_KEY=...
CONTENT_LLM_BASE_URL=https://api.openai.com/v1
CONTENT_LLM_MODEL=gpt-4.1-mini
```

### 2. 자동 공개 중단/검수 강화

지금 구조는 품질 점수 기준을 통과하면 `approved`로 저장한다. 하지만 돈 되는 블로그로 가려면 아래처럼 바꾸는 것이 좋다.

- LLM API 없으면 무조건 `draft`
- LLM API 있어도 품질 점수 낮으면 `draft`
- `quality_checks`를 통과한 글만 `/cloud-blog`에 노출
- 가능하면 첫 20~50개 글은 사람이 직접 검수

### 3. 검색 키워드 전략

무작정 매일 글을 만들면 안 된다. 먼저 아래 기준으로 키워드 큐를 만들어야 한다.

- 검색 의도가 명확한 키워드
- 도구 선택/비교/템플릿/자동화 방법처럼 구매 의도가 섞인 키워드
- 너무 경쟁이 큰 단어보다 긴 롱테일 키워드
- 예: `ChatGPT 업무 자동화 프롬프트`, `Notion AI 업무 정리 템플릿`, `Zapier 대체 자동화 툴`

### 4. 수익화

돈은 바로 나지 않는다.

순서:

1. LLM API 연결
2. 검색 의도 기반 양질 글 20~50개 확보
3. Search Console 연결
4. 유입 키워드 확인
5. 글별 CTA 추가
6. 제휴 링크 또는 리드 수집 폼 연결
7. 트래픽이 쌓이면 AdSense 신청

초기 수익화 후보:

- SaaS affiliate
- 자동화 템플릿 판매
- 체크리스트/Notion 템플릿 다운로드
- 컨설팅 문의 폼
- AdSense는 후순위

## 첫째 컴퓨터에서 바로 할 다음 작업

1. `bartkoh88/blog` clone
2. Vercel env 확인
3. OpenAI API key를 Vercel Production에 추가
4. `npx vercel --prod --yes`로 재배포
5. `/api/cron/generate`를 수동 실행해서 LLM 글 생성 확인
6. Supabase `articles`와 `quality_checks` 확인
7. `/cloud-blog`에서 공개 글 확인
8. 자동 공개 정책을 `draft first`로 바꾸는 코드 수정

## 수동 Cron 테스트 방법

`CRON_SECRET`은 Vercel sensitive env라 pull되지 않을 수 있다. 테스트하려면 새 secret을 만들어 넣고 재배포한 뒤 같은 셸에서 호출한다.

```powershell
cd C:\dev\bartkoh-blog

$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$cronSecret = [Convert]::ToBase64String($bytes)

npx vercel env rm CRON_SECRET production --yes
$cronSecret | npx vercel env add CRON_SECRET production
npx vercel --prod --yes

$headers = @{ Authorization = "Bearer $cronSecret" }
Invoke-WebRequest -Uri "https://blog.bartkoh.com/api/cron/generate/" -Headers $headers -UseBasicParsing
```

## 절대 하지 말 것

- API 키를 README, AGENTS, 코드, 커밋 메시지에 쓰지 않는다.
- `bartkoh` 계열이 아닌 GitHub/Vercel/Supabase 자격으로 이 프로젝트를 배포하지 않는다.
- LLM API 없이 고품질 글 자동 생성이 된다고 가정하지 않는다.
- 검수 없는 자동 공개를 수익화 블로그의 최종 구조로 보지 않는다.

## 한 줄 요약

첫째 컴퓨터로 옮겨도 된다. 오히려 옮기는 것이 맞다. 현재 시스템은 클라우드 배포/저장/cron 뼈대까지 되어 있고, 다음 병목은 `LLM API 연결 + 품질 검수 + 수익화 CTA`다.
