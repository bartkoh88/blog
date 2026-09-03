import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_TOPIC = '비개발자를 위한 Codex와 바이브코딩 시작법'
const DEFAULT_AUDIENCE = 'AI 도구는 써봤지만 개발은 막막한 비개발자'
const MAX_FILE_BYTES = 180_000
const DEFAULT_LIMIT = 20

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.obsidian',
  '.vercel',
  '.yarn',
  'node_modules',
  'content-workbench',
])

const TOPIC_KEYWORDS = [
  'codex',
  '코덱스',
  'claude',
  '클로드',
  'claude code',
  '바이브',
  'vibe',
  'vibecoding',
  '바이브코딩',
  'ai 코딩',
  '터미널',
  'terminal',
  'github',
  'git',
  'vercel',
  'supabase',
  'env',
  'api key',
  '배포',
  '에러',
  '오류',
  '프롬프트',
  '비개발자',
]

const SENSITIVE_PATTERNS = [
  { label: 'email', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { label: 'phone', pattern: /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g },
  { label: 'openai_key', pattern: /sk-[A-Za-z0-9_-]{20,}/g },
  { label: 'supabase_jwt', pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g },
  { label: 'secret_assignment', pattern: /\b[A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*\s*=\s*['"]?[^'"\s]+/gi },
  { label: 'money', pattern: /(?:₩|￦|\$)\s?\d[\d,]*(?:\.\d+)?|\d[\d,]*\s?(?:원|만원|억원)/g },
]

function parseArgs(argv) {
  const args = {
    sources: [],
    topic: DEFAULT_TOPIC,
    audience: DEFAULT_AUDIENCE,
    limit: DEFAULT_LIMIT,
    outDir: 'content-workbench',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--source') {
      args.sources.push(argv[index + 1])
      index += 1
    } else if (arg === '--topic') {
      const values = []
      while (argv[index + 1] && !argv[index + 1].startsWith('--')) {
        values.push(argv[index + 1])
        index += 1
      }
      args.topic = values.join(' ').replace(/^['"]|['"]$/g, '') || args.topic
    } else if (arg === '--audience') {
      const values = []
      while (argv[index + 1] && !argv[index + 1].startsWith('--')) {
        values.push(argv[index + 1])
        index += 1
      }
      args.audience = values.join(' ').replace(/^['"]|['"]$/g, '') || args.audience
    } else if (arg === '--limit') {
      args.limit = Number(argv[index + 1] || DEFAULT_LIMIT)
      index += 1
    } else if (arg === '--out') {
      args.outDir = argv[index + 1] || args.outDir
      index += 1
    } else if (arg === '--help') {
      printHelp()
      process.exit(0)
    }
  }

  return args
}

function printHelp() {
  console.log(`사용법:
corepack yarn content:draft -- --source <허용된_MD_폴더> --topic "글 주제"

예:
corepack yarn content:draft -- --source E:\\dev\\obsidian-vault\\AI --topic "비개발자를 위한 Codex 시작법"

옵션:
  --source   읽을 폴더입니다. 여러 번 넣을 수 있습니다.
  --topic    만들 글의 주제입니다.
  --audience 목표 독자입니다.
  --limit    참고할 파일 수입니다. 기본값은 20입니다.
  --out      산출물 폴더입니다. 기본값은 content-workbench입니다.`)
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^0-9a-z가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function collectMarkdownFiles(rootDir) {
  const files = []

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          await walk(fullPath)
        }
      } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
        files.push(fullPath)
      }
    }
  }

  await walk(rootDir)
  return files
}

function redactSensitive(text) {
  let redacted = text
  const hits = []

  for (const item of SENSITIVE_PATTERNS) {
    const matches = [...redacted.matchAll(item.pattern)]
    if (matches.length) {
      hits.push({ label: item.label, count: matches.length })
      redacted = redacted.replace(item.pattern, `[${item.label}_redacted]`)
    }
  }

  return { redacted, hits }
}

function stripFrontmatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

function isUsefulEvidenceLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (trimmed === '---') return false
  if (/^(title|date|lastmod|draft|summary|authors|tags|layout):/i.test(trimmed)) return false
  if (/^-\s*(default|ai-tools|workflow-automation|productivity)\s*$/i.test(trimmed)) return false
  return trimmed.length >= 20
}

function findSensitiveLines(text) {
  const lines = text.split(/\r?\n/)
  const suspects = []

  lines.forEach((line, index) => {
    const lowered = line.toLowerCase()
    const keywordHit =
      lowered.includes('secret') ||
      lowered.includes('token') ||
      lowered.includes('api key') ||
      lowered.includes('apikey') ||
      lowered.includes('password') ||
      lowered.includes('service_role') ||
      lowered.includes('.env')

    const patternHit = SENSITIVE_PATTERNS.some((item) => item.pattern.test(line))
    SENSITIVE_PATTERNS.forEach((item) => {
      item.pattern.lastIndex = 0
    })

    if (keywordHit || patternHit) {
      suspects.push({
        line: index + 1,
        preview: redactSensitive(line).redacted.slice(0, 220),
      })
    }
  })

  return suspects
}

function scoreContent(content, topic) {
  const lowered = `${content}\n${topic}`.toLowerCase()
  let score = 0

  for (const keyword of TOPIC_KEYWORDS) {
    if (lowered.includes(keyword.toLowerCase())) score += 8
  }

  if (lowered.includes('실패') || lowered.includes('막혔') || lowered.includes('무섭')) score += 18
  if (lowered.includes('비개발자') || lowered.includes('초보') || lowered.includes('초심자')) score += 20
  if (lowered.includes('배운 점') || lowered.includes('회고') || lowered.includes('교훈')) score += 14

  return score
}

function extractEvidence(content, topic) {
  const lines = stripFrontmatter(content).split(/\r?\n/)
  const topicWords = topic
    .toLowerCase()
    .split(/[^0-9a-z가-힣]+/i)
    .filter((word) => word.length >= 2)
  const keywords = [...TOPIC_KEYWORDS, ...topicWords]
  const snippets = []

  lines.forEach((line, index) => {
    if (!isUsefulEvidenceLine(line)) return

    const lowered = line.toLowerCase()
    const matched = keywords.some((keyword) => lowered.includes(keyword.toLowerCase()))
    if (!matched) return

    const start = Math.max(0, index - 1)
    const end = Math.min(lines.length, index + 2)
    const snippet = lines
      .slice(start, end)
      .filter(isUsefulEvidenceLine)
      .join('\n')
      .trim()
    if (snippet) snippets.push(redactSensitive(snippet).redacted)
  })

  return [...new Set(snippets)].slice(0, 4)
}

async function analyzeFile(filePath, topic) {
  const stat = await fs.stat(filePath)
  if (stat.size > MAX_FILE_BYTES) return null

  const raw = await fs.readFile(filePath, 'utf8')
  const score = scoreContent(raw, topic)
  if (score <= 0) return null

  const { redacted, hits } = redactSensitive(raw)
  return {
    filePath,
    score,
    hash: crypto.createHash('sha1').update(raw).digest('hex').slice(0, 12),
    snippets: extractEvidence(redacted, topic),
    sensitiveHits: hits,
    sensitiveLines: findSensitiveLines(raw).slice(0, 12),
  }
}

function createBeginnerDraft({ topic, audience, sources }) {
  const evidenceBullets = sources
    .flatMap((source) => source.snippets.map((snippet) => ({ source, snippet })))
    .slice(0, 8)

  const sourceLessons = evidenceBullets.length
    ? evidenceBullets
        .map((item) => {
          const oneLine = item.snippet.replace(/\s+/g, ' ').slice(0, 170)
          return `- ${oneLine}`
        })
        .join('\n')
    : '- 아직 충분한 사례 문단을 찾지 못했습니다. 허용할 source 폴더를 더 구체적으로 지정해 주세요.'

  return `---
title: '${topic}'
date: '${new Date().toISOString().slice(0, 10)}'
draft: true
summary: '${audience}를 위해 Claude, Codex, 바이브코딩의 문턱을 낮추는 초보자 친화 가이드 초안입니다.'
tags:
  - vibe-coding
  - codex
  - beginner-guide
authors:
  - default
---

# ${topic}

전문 개발자가 설명하는 Claude Code나 Codex 영상은 빠릅니다. 보는 사람은 분명히 고개를 끄덕였는데, 막상 혼자 따라 하려면 손이 멈춥니다.

이 글은 ${audience}를 위한 초안입니다. 목표는 멋진 개발 용어를 많이 아는 것이 아니라, 처음 한 걸음을 무섭지 않게 떼는 것입니다.

## 먼저 알아야 할 한 가지

바이브코딩은 “AI가 알아서 다 해주는 마법”이 아닙니다. 더 가까운 비유는 **운전을 처음 배우는 사람이 옆자리에 숙련된 조수를 태우는 것**입니다.

조수가 길을 알려주고, 어려운 조작을 도와줄 수는 있습니다. 하지만 어디로 갈지, 위험한 길로 들어가고 있는지, 지금 멈춰서 확인해야 하는지는 운전자가 알아야 합니다.

비개발자에게 Codex와 Claude는 바로 그 조수입니다.

## 초심자가 가장 자주 무서워하는 지점

- 터미널에 영어와 기호가 잔뜩 뜨면 뭔가 망가진 것처럼 느껴집니다.
- GitHub, Vercel, Supabase가 각각 무엇을 하는지 헷갈립니다.
- AI가 코드를 고쳤다고 하는데, 정말 맞는지 판단하기 어렵습니다.
- \`.env\`나 API 키 같은 단어가 나오면 실수로 비밀을 공개할까 봐 겁이 납니다.
- 전문가는 “그냥 실행하면 됩니다”라고 말하지만, 초보자는 “어디에 입력하는데요?”에서 막힙니다.

이 두려움은 이상한 것이 아닙니다. 오히려 정상입니다. 중요한 것은 무서움을 없애는 것이 아니라, 망가지지 않게 확인하면서 가는 절차를 만드는 것입니다.

## 실제 기록에서 뽑은 단서

아래 내용은 허용된 MD 자료에서 뽑은 단서입니다. 공개 전에는 반드시 사실관계와 민감정보를 다시 확인해야 합니다.

${sourceLessons}

## 비개발자가 Codex에게 일을 맡기는 안전한 순서

1. 먼저 원하는 결과를 한국어로 설명합니다.
2. Codex에게 바로 코딩시키지 말고, 기획 체크리스트를 먼저 만들게 합니다.
3. 바꿀 파일과 바꾸면 안 되는 파일을 구분합니다.
4. 코드를 고친 뒤에는 빌드나 테스트를 돌려 확인합니다.
5. 배포, DB 변경, API 키 설정은 마지막에 따로 승인하고 진행합니다.

이 순서는 느려 보이지만 실제로는 더 빠릅니다. 초보자가 가장 많이 시간을 잃는 지점은 코드를 치는 순간이 아니라, 뭘 바꿨는지 모르는 상태에서 에러가 난 뒤입니다.

## 쉬운 비유로 보는 개발 도구

| 도구 | 쉬운 비유 | 초보자가 기억할 것 |
| --- | --- | --- |
| GitHub | 작업 이력을 보관하는 금고 | 되돌릴 수 있게 기록을 남기는 곳입니다. |
| Vercel | 웹사이트를 인터넷에 올리는 배달 시스템 | 내 컴퓨터가 꺼져도 사이트가 보이게 합니다. |
| Supabase | 데이터를 넣어두는 창고 | 글, 회원, 설정 같은 정보를 저장합니다. |
| .env | 비밀번호를 적어두는 잠긴 수첩 | 절대 공개 저장소에 올리면 안 됩니다. |
| Codex | 코드 작업을 도와주는 조수 | 시키기 전에 목표와 금지선을 정해야 합니다. |

## 따라 하기 전에 체크할 것

- 지금 작업이 연습인지, 실제 운영 사이트인지 확인했나요?
- AI에게 “먼저 계획을 보여줘”라고 말했나요?
- 삭제, 배포, DB 변경 같은 위험 작업은 따로 승인하도록 했나요?
- 에러가 나면 복사해서 물어볼 준비가 되어 있나요?
- API 키나 비밀번호가 화면이나 파일에 그대로 들어가 있지 않나요?

## 이건 아직 몰라도 됩니다

처음부터 Next.js, TypeScript, 서버 컴포넌트, RLS 같은 말을 모두 이해할 필요는 없습니다.

처음 단계에서 중요한 것은 딱 세 가지입니다.

1. 무엇을 만들고 싶은지 말로 설명한다.
2. AI가 바꾸려는 내용을 먼저 확인한다.
3. 결과가 맞는지 작은 단위로 검증한다.

이 세 가지가 되면 비개발자도 바이브코딩의 문턱을 넘을 수 있습니다.

## 공개 전 편집 메모

- 실제 대표님 경험을 더 구체적으로 한 단락 추가하면 글의 힘이 커집니다.
- 민감한 사람명, 회사명, 금액, 계정 정보는 익명화해야 합니다.
- 스크린샷이나 실제 에러 예시가 있으면 초심자에게 더 도움이 됩니다.
`
}

function createReport({ topic, sources, allFilesCount }) {
  const sourceLines = sources
    .map((source, index) => {
      const redactions = source.sensitiveHits.length
        ? source.sensitiveHits.map((hit) => `${hit.label}:${hit.count}`).join(', ')
        : '없음'
      return `${index + 1}. ${source.filePath}
   - score: ${source.score}
   - sha1: ${source.hash}
   - 민감정보 자동 가림: ${redactions}`
    })
    .join('\n\n')

  const sensitiveLines = sources
    .flatMap((source) =>
      source.sensitiveLines.map(
        (item) => `- ${source.filePath}:${item.line} ${item.preview || '(빈 줄)'}`
      )
    )
    .slice(0, 80)
    .join('\n')

  return `# 콘텐츠 엔진 검수 보고서

생성 시각: ${new Date().toISOString()}
주제: ${topic}

## 처리 요약

- 검색한 MD/MDX 파일 수: ${allFilesCount}
- 초안에 참고한 파일 수: ${sources.length}
- 원본 파일 수정 여부: 없음

## 참고 파일

${sourceLines || '참고 파일이 없습니다.'}

## 민감정보 의심 문장

아래 항목은 공개 전 사람이 직접 확인해야 합니다.

${sensitiveLines || '자동 탐지된 민감정보 의심 문장이 없습니다.'}

## 공개 전 체크리스트

- [ ] 사람 이름, 회사명, 고객명, 계약, 금액이 공개되어도 되는지 확인
- [ ] API 키, 토큰, secret, .env 값이 들어가지 않았는지 확인
- [ ] 실제 경험이 과장 없이 들어갔는지 확인
- [ ] 초심자가 모를 만한 용어에 쉬운 비유가 붙었는지 확인
- [ ] 글을 바로 공개하지 않고 draft로 유지
`
}

async function ensureWorkbench(outDir) {
  const dirs = ['drafts', 'reports', 'source-index'].map((dir) => path.join(outDir, dir))
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true })
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.sources.length) {
    console.error('오류: --source 폴더를 최소 1개 지정해야 합니다. 원본 vault 전체를 자동으로 읽지 않습니다.')
    printHelp()
    process.exit(1)
  }

  const sourceRoots = []
  for (const source of args.sources) {
    const absolute = path.resolve(source)
    if (!(await pathExists(absolute))) {
      console.error(`오류: source 폴더를 찾을 수 없습니다: ${absolute}`)
      process.exit(1)
    }
    sourceRoots.push(absolute)
  }

  const allFiles = []
  for (const root of sourceRoots) {
    allFiles.push(...(await collectMarkdownFiles(root)))
  }

  const analyzed = []
  for (const file of allFiles) {
    const result = await analyzeFile(file, args.topic)
    if (result) analyzed.push(result)
  }

  const selected = analyzed.sort((a, b) => b.score - a.score).slice(0, args.limit)
  await ensureWorkbench(args.outDir)

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const baseName = `${slugify(args.topic)}-${stamp}`
  const draftPath = path.join(args.outDir, 'drafts', `${baseName}.mdx`)
  const reportPath = path.join(args.outDir, 'reports', `${baseName}.md`)
  const indexPath = path.join(args.outDir, 'source-index', `${baseName}.json`)

  await fs.writeFile(
    draftPath,
    createBeginnerDraft({ topic: args.topic, audience: args.audience, sources: selected }),
    'utf8'
  )
  await fs.writeFile(
    reportPath,
    createReport({ topic: args.topic, sources: selected, allFilesCount: allFiles.length }),
    'utf8'
  )
  await fs.writeFile(
    indexPath,
    JSON.stringify(
      {
        topic: args.topic,
        audience: args.audience,
        createdAt: new Date().toISOString(),
        sourceRoots,
        allFilesCount: allFiles.length,
        selected: selected.map((source) => ({
          filePath: source.filePath,
          score: source.score,
          hash: source.hash,
          sensitiveHits: source.sensitiveHits,
        })),
      },
      null,
      2
    ),
    'utf8'
  )

  console.log(`초안 생성: ${draftPath}`)
  console.log(`보고서 생성: ${reportPath}`)
  console.log(`소스 인덱스 생성: ${indexPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
