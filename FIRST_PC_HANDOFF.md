# Bartkoh Blog First PC Handoff

작성일: 2026-06-26

이 문서는 K1608에서 진행한 `blog.bartkoh.com` 프로젝트를 첫째 컴퓨터(X1/주 작업 PC)에서 이어받기 위한 인수인계 가이드입니다.

## 결론

이 프로젝트는 K1608에 계속 묶어둘 필요가 없습니다. 첫째 컴퓨터로 옮겨서 운영하는 것이 맞습니다.

이유:

- 블로그 소스는 GitHub `bartkoh88/blog`에 있음
- 배포는 Vercel `bartkoh-7848s-projects/blog`에서 자동 진행
- 글 저장소는 Supabase `bartkoh` 프로젝트
- Vercel Cron은 클라우드에서 실행되므로 로컬 컴퓨터 전원과 무관
- K1608 로컬에만 남아 있던 것은 실험용 자동화 코드와 작업 맥락뿐임

## 계정 분리 원칙

반드시 지킬 것:

- `bartkoh` 계열과 `gssp` 계열 로그인/토큰/원격 저장소를 섞지 않는다.
- 블로그 운영은 `bartkoh88`, `bartkoh-7848s-projects`, Supabase `bartkoh` 기준으로 진행한다.
- `gsspboy/dev`는 인수인계와 작업 메모 저장소로만 본다.
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

K1608에서 만든 로컬 자동화 코드 위치:

```text
C:\dev\ai-content-revenue
```

아직 별도 GitHub repo로 올리지 않았다. 첫째 컴퓨터에서 이어가려면 둘 중 하나를 선택한다.

추천:

```text
bartkoh88/ai-content-revenue
```

를 private repo로 만들고, K1608의 `C:\dev\ai-content-revenue` 내용을 올린 뒤 첫째 컴퓨터에서 clone한다.

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
- `gsspboy` GitHub/Vercel/Supabase 자격으로 `bartkoh` 프로젝트를 배포하지 않는다.
- LLM API 없이 고품질 글 자동 생성이 된다고 가정하지 않는다.
- 검수 없는 자동 공개를 수익화 블로그의 최종 구조로 보지 않는다.

## 한 줄 요약

첫째 컴퓨터로 옮겨도 된다. 오히려 옮기는 것이 맞다. 현재 시스템은 클라우드 배포/저장/cron 뼈대까지 되어 있고, 다음 병목은 `LLM API 연결 + 품질 검수 + 수익화 CTA`다.
