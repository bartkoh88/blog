import 'server-only'

export type CloudArticle = {
  id: number
  title: string
  slug: string
  meta_description: string
  body_markdown: string
  status: string
  created_at: string
}

type SupabaseEnv = {
  url: string
  key: string
}

const KEYWORDS = [
  'AI 회의록 자동화',
  'Notion AI 업무 정리',
  'ChatGPT 이메일 자동화',
  'Zapier 대체 자동화 툴',
  '1인 사업자 AI 워크플로우',
  '콘텐츠 자동화 체크리스트',
  'Supabase 블로그 자동화',
]

const TAGLINE = 'AI 도구와 자동화를 실제 업무에 적용하는 방법을 과장 없이 정리한 실험형 글입니다.'

function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return { url, key }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^0-9a-z가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, key } = getSupabaseEnv()
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Supabase request failed: ${response.status} ${message}`)
  }
  return response.json() as Promise<T>
}

async function nextId(table: string): Promise<number> {
  const params = new URLSearchParams({ select: 'id', order: 'id.desc', limit: '1' })
  const rows = await supabaseFetch<Array<{ id: number }>>(`${table}?${params}`)
  return rows.length ? rows[0].id + 1 : 1
}

async function findBy<T>(
  table: string,
  column: string,
  value: string,
  select = '*'
): Promise<T | null> {
  const params = new URLSearchParams({ select, [column]: `eq.${value}`, limit: '1' })
  const rows = await supabaseFetch<T[]>(`${table}?${params}`)
  return rows[0] || null
}

async function insertRow<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const rows = await supabaseFetch<T[]>(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  })
  return rows[0]
}

function pickKeyword() {
  const day = Math.floor(Date.now() / 86_400_000)
  return KEYWORDS[day % KEYWORDS.length]
}

function buildBody(keyword: string, title: string) {
  return [
    `# ${title}`,
    '',
    TAGLINE,
    '',
    `이 글은 ${keyword}를 업무에 적용하기 전에 확인해야 할 기준과 실행 순서를 정리합니다.`,
    '',
    '## 1. 먼저 해결할 문제를 정합니다',
    '',
    `- ${keyword}로 줄이고 싶은 반복 업무를 하나만 고릅니다.`,
    '- 결과물이 문서, 알림, 표, 발행물 중 무엇인지 정합니다.',
    '- 자동화 전후 시간을 기록해 효과를 확인합니다.',
    '',
    '## 2. 도구를 너무 많이 붙이지 않습니다',
    '',
    '- 처음에는 입력, 처리, 출력 세 단계만 만듭니다.',
    '- 실패했을 때 사람이 다시 처리할 수 있는 경로를 남깁니다.',
    '- 유료 도구는 실제로 시간이 줄어드는지 확인한 뒤 붙입니다.',
    '',
    '## 3. 운영 체크리스트',
    '',
    '- 개인정보나 API 키가 외부로 노출되지 않는지 확인합니다.',
    '- 자동 생성 결과는 바로 공개하지 말고 검수 상태를 거칩니다.',
    '- 글, 이메일, 보고서처럼 외부에 나가는 결과물은 사람이 마지막으로 확인합니다.',
    '',
    '## 다음 행동',
    '',
    '작은 업무 하나를 골라 자동화 후보로 적고, 실행 시간과 반복 빈도를 기록해 보십시오.',
  ].join('\n')
}

export async function listCloudArticles(): Promise<CloudArticle[]> {
  const params = new URLSearchParams({
    select: 'id,title,slug,meta_description,body_markdown,status,created_at',
    status: 'eq.approved',
    order: 'created_at.desc',
    limit: '20',
  })
  return supabaseFetch<CloudArticle[]>(`articles?${params}`)
}

export async function getCloudArticle(slug: string): Promise<CloudArticle | null> {
  return findBy<CloudArticle>(
    'articles',
    'slug',
    slug,
    'id,title,slug,meta_description,body_markdown,status,created_at'
  )
}

export async function generateCloudArticle() {
  const keyword = pickKeyword()
  const title = `${keyword} 실전 가이드`
  const slug = slugify(title)
  const existing = await findBy<CloudArticle>(
    'articles',
    'slug',
    slug,
    'id,title,slug,status,created_at'
  )
  if (existing) {
    return { status: 'skipped', article: existing }
  }

  let keywordRow = await findBy<{ id: number }>('keywords', 'keyword', keyword, 'id')
  if (!keywordRow) {
    keywordRow = await insertRow<{ id: number }>('keywords', {
      id: await nextId('keywords'),
      keyword,
      source: 'vercel-cron',
      language: 'ko',
      status: 'briefed',
      intent_score: 70,
      affiliate_score: 45,
      difficulty_score: 25,
      evergreen_score: 65,
      risk_score: 0,
      total_score: 80,
    })
  }

  const brief = await insertRow<{ id: number }>('content_briefs', {
    id: await nextId('content_briefs'),
    keyword_id: keywordRow.id,
    primary_intent: 'how_to',
    audience: 'solo operators',
    title_options: [title],
    outline: ['문제 정의', '도구 선택', '실행 체크리스트'],
    evidence_needed: ['공식 문서 확인', '실제 적용 흐름 확인'],
    cta_type: 'checklist',
    affiliate_candidates: ['SaaS affiliate', 'automation template'],
    status: 'drafted',
  })

  const article = await insertRow<CloudArticle>('articles', {
    id: await nextId('articles'),
    brief_id: brief.id,
    language: 'ko',
    title,
    slug,
    meta_description: `${keyword}를 실제 업무에 적용하기 위한 단계별 자동화 가이드입니다.`,
    body_markdown: buildBody(keyword, title),
    status: 'approved',
    needs_english_expansion: false,
  })

  return { status: 'created', article }
}
