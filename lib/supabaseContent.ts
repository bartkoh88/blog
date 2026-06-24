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

type TopicPlan = {
  keyword: string
  title: string
  intent: string
  audience: string
  painPoints: string[]
  workflow: string[]
  toolCandidates: string[]
  pitfalls: string[]
  faq: Array<[string, string]>
  cta: string
}

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>
}

const TOPIC_PLANS: TopicPlan[] = [
  {
    keyword: 'ChatGPT 업무 자동화 프롬프트',
    title: 'ChatGPT 업무 자동화 프롬프트를 실제 업무에 쓰는 방법',
    intent: '반복 업무를 줄이고 싶은 사람이 바로 복사해 쓸 수 있는 프롬프트 구조를 찾는다.',
    audience: '혼자 일하거나 작은 팀에서 문서, 이메일, 보고서를 반복 작성하는 사람',
    painPoints: [
      '프롬프트 예시는 많은데 실제 업무 흐름에 붙이면 결과가 들쭉날쭉하다.',
      '처음에는 편해 보이지만 검수 시간이 늘어나면 자동화 효과가 사라진다.',
      '회사 정보나 고객 정보를 어디까지 넣어도 되는지 판단하기 어렵다.',
    ],
    workflow: [
      '업무를 입력 자료, 판단 기준, 출력 형식으로 나눈다.',
      '프롬프트에 역할보다 검수 기준과 금지 조건을 먼저 적는다.',
      '출력은 표, 체크리스트, 이메일 초안처럼 바로 확인 가능한 형식으로 제한한다.',
      '첫 결과물을 그대로 쓰지 말고 누락, 과장, 민감정보 포함 여부를 확인한다.',
    ],
    toolCandidates: ['ChatGPT', 'Claude', 'Google Gemini', 'Notion AI'],
    pitfalls: [
      '모든 업무를 한 번에 자동화하려고 하면 실패한다.',
      '검수 기준 없이 긴 글만 생성하면 사람이 쓴 티보다 AI가 만든 티가 더 강해진다.',
      '고객명, 전화번호, 내부 매출 같은 민감정보를 그대로 넣으면 안 된다.',
    ],
    faq: [
      [
        '프롬프트를 길게 쓰면 항상 좋아지나요?',
        '아닙니다. 긴 프롬프트보다 입력, 기준, 출력 형식이 분명한 프롬프트가 더 안정적입니다.',
      ],
      [
        '처음 자동화할 업무는 무엇이 좋나요?',
        '회의록 정리, 이메일 초안, 반복 보고서처럼 정답보다 구조가 중요한 업무가 좋습니다.',
      ],
    ],
    cta: '먼저 지난주에 세 번 이상 반복한 업무 하나를 고르고, 그 업무의 입력 자료와 최종 결과물을 한 문장으로 적어보십시오.',
  },
  {
    keyword: 'Notion AI 업무 정리 템플릿',
    title: 'Notion AI 업무 정리 템플릿을 만드는 실전 순서',
    intent: '메모와 회의 내용을 업무 실행 목록으로 바꾸는 Notion AI 구조를 찾는다.',
    audience: '회의, 아이디어, 고객 요청이 여러 곳에 흩어지는 1인 사업자와 운영자',
    painPoints: [
      '메모는 많은데 다음 행동이 분리되지 않아 다시 읽는 시간이 길다.',
      'Notion 페이지가 쌓일수록 검색과 분류가 어려워진다.',
      'AI 요약은 그럴듯하지만 실제 담당자와 마감일이 빠지는 경우가 많다.',
    ],
    workflow: [
      '페이지 속성을 날짜, 출처, 상태, 다음 행동, 마감일로 고정한다.',
      'AI에게 요약보다 다음 행동, 결정사항, 보류사항을 나눠 뽑게 한다.',
      '회의록과 아이디어 노트를 같은 데이터베이스에 넣되 보기만 분리한다.',
      '매일 아침 상태가 보류가 아닌 항목만 필터링해서 실행 목록으로 본다.',
    ],
    toolCandidates: ['Notion AI', 'Notion Database', 'Google Calendar', 'Slack'],
    pitfalls: [
      '속성을 너무 많이 만들면 입력이 귀찮아져 시스템이 죽는다.',
      '모든 노트를 AI로 요약하려고 하면 중요한 원문 맥락을 잃는다.',
      '자동 태그만 믿고 사람이 보는 주간 리뷰를 없애면 누락이 생긴다.',
    ],
    faq: [
      [
        '템플릿은 복잡할수록 좋은가요?',
        '아닙니다. 매일 쓰는 템플릿은 입력 항목이 적고 상태 변경이 쉬워야 오래 갑니다.',
      ],
      [
        'Notion AI만으로 프로젝트 관리가 되나요?',
        '작은 업무는 가능하지만, 외부 협업과 알림이 중요하면 캘린더나 메신저 자동화와 함께 쓰는 편이 낫습니다.',
      ],
    ],
    cta: '오늘 새 Notion 데이터베이스를 만들기보다 기존 메모 10개를 가져와 다음 행동이 뽑히는지 먼저 시험하십시오.',
  },
  {
    keyword: 'Zapier 대체 자동화 툴',
    title: 'Zapier 대체 자동화 툴을 고를 때 보는 기준',
    intent: '자동화 비용을 줄이거나 더 유연한 워크플로우 도구를 비교한다.',
    audience: 'Zapier 비용이 부담되거나 복잡한 조건 분기가 필요한 운영자',
    painPoints: [
      '처음에는 편하지만 작업 수가 늘면 월 비용이 빠르게 오른다.',
      '조건 분기와 재시도 처리가 약하면 중요한 자동화에서 불안하다.',
      '도구를 바꿨다가 기존 자동화가 깨질까 봐 결정을 미룬다.',
    ],
    workflow: [
      '현재 자동화를 트리거, 액션, 월 실행 횟수, 실패 시 영향으로 나눈다.',
      '가격보다 실패했을 때 복구가 쉬운지 먼저 본다.',
      '무료 플랜으로 핵심 자동화 하나만 옮겨 2주 동안 로그를 본다.',
      '결제 전에는 팀원 권한, 웹훅, API 제한, 데이터 보관 기간을 확인한다.',
    ],
    toolCandidates: ['Make', 'n8n', 'Pipedream', 'Zapier'],
    pitfalls: [
      '무료 플랜만 보고 옮기면 실제 운영량에서 다시 비싸질 수 있다.',
      '복잡한 자동화를 한 번에 이전하면 어디서 실패했는지 추적하기 어렵다.',
      '셀프호스팅 도구는 서버 운영 시간을 비용에 포함해야 한다.',
    ],
    faq: [
      [
        '가장 싼 도구가 정답인가요?',
        '아닙니다. 자동화는 실패했을 때 복구 비용이 더 클 수 있어 로그와 재시도 기능이 중요합니다.',
      ],
      [
        'n8n은 누구에게 맞나요?',
        '기술 설정을 감당할 수 있고 장기적으로 비용과 제어권을 중시하는 사람에게 맞습니다.',
      ],
    ],
    cta: '지금 쓰는 자동화 중 월 실행 횟수가 가장 많은 것 하나를 골라, 대체 도구에서 같은 흐름을 무료로 재현해 보십시오.',
  },
  {
    keyword: '1인 사업자 AI 워크플로우',
    title: '1인 사업자가 하루 업무를 줄이는 AI 워크플로우 설계법',
    intent: '혼자 처리하는 마케팅, 고객 응대, 문서 업무를 AI로 줄이는 순서를 찾는다.',
    audience: '콘텐츠, 상담, 문서, 운영을 혼자 처리하는 1인 사업자',
    painPoints: [
      '해야 할 일은 많은데 자동화할 순서를 정하지 못한다.',
      'AI 도구를 여러 개 결제했지만 매일 쓰는 흐름으로 연결되지 않는다.',
      '자동화보다 도구 세팅에 시간을 더 쓰게 된다.',
    ],
    workflow: [
      '하루 업무를 수익 직접 업무, 운영 업무, 기록 업무로 나눈다.',
      '수익 직접 업무는 AI가 대신하기보다 준비 시간을 줄이는 용도로 쓴다.',
      '운영 업무는 템플릿과 자동 알림으로 먼저 줄인다.',
      '기록 업무는 회의록, 상담 메모, 콘텐츠 아이디어처럼 나중에 재사용되는 형태로 저장한다.',
    ],
    toolCandidates: ['ChatGPT', 'Notion', 'Google Sheets', 'Make'],
    pitfalls: [
      '처음부터 완전 자동화를 목표로 잡으면 실행이 늦어진다.',
      '돈을 버는 업무까지 검수 없이 자동화하면 신뢰가 떨어진다.',
      '기록 위치가 여러 곳이면 자동화가 오히려 일을 늘린다.',
    ],
    faq: [
      [
        'AI 워크플로우는 어디부터 시작해야 하나요?',
        '반복 빈도가 높고 실패해도 손실이 작은 업무부터 시작하는 것이 좋습니다.',
      ],
      [
        '유료 도구는 언제 결제해야 하나요?',
        '무료 또는 수동 방식으로 효과를 확인한 뒤, 절약되는 시간이 월 비용보다 클 때 결제하는 편이 안전합니다.',
      ],
    ],
    cta: '오늘 업무 기록에서 반복된 작업 세 개를 표시하고, 그중 고객에게 직접 노출되지 않는 작업부터 자동화 후보로 정하십시오.',
  },
]

const TAGS = ['ai-tools', 'workflow-automation', 'productivity']

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

function pickTopic() {
  const day = Math.floor(Date.now() / 86_400_000)
  return TOPIC_PLANS[day % TOPIC_PLANS.length]
}

function bulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n')
}

function buildComparisonTable(topic: TopicPlan) {
  return [
    '| 기준 | 먼저 확인할 것 | 왜 중요한가 |',
    '| --- | --- | --- |',
    `| 검색 의도 | ${topic.intent} | 글이 도구 소개로 흐르지 않고 문제 해결에 집중합니다. |`,
    '| 운영 난이도 | 사람이 매일 유지할 수 있는가 | 자동화는 복잡도보다 지속성이 중요합니다. |',
    '| 검수 방식 | 결과를 누가 언제 확인하는가 | AI가 만든 티는 대개 검수 없는 문장에서 드러납니다. |',
    '| 비용 판단 | 절약 시간과 월 비용을 비교했는가 | 돈을 버는 글은 독자에게도 합리적 선택 기준을 줘야 합니다. |',
  ].join('\n')
}

function buildBody(topic: TopicPlan) {
  return [
    `# ${topic.title}`,
    '',
    `이 글은 ${topic.audience}를 위해 쓴 실전 가이드입니다. 도구 이름을 나열하기보다 실제 업무에서 어디에 붙이고, 어디서 멈춰야 하는지를 기준으로 정리합니다.`,
    '',
    '## 이 글이 답하는 검색 의도',
    '',
    topic.intent,
    '',
    '검색해서 들어온 사람이 원하는 것은 멋진 자동화 구호가 아니라, 오늘 자기 업무에 적용해도 되는 판단 기준입니다. 그래서 아래 순서는 바로 실행할 수 있는 작은 단위로 구성했습니다.',
    '',
    '## 사람들이 실제로 막히는 지점',
    '',
    bulletList(topic.painPoints),
    '',
    '이 문제들은 도구를 하나 더 결제한다고 해결되지 않습니다. 먼저 업무 흐름을 작게 나누고, AI가 맡을 부분과 사람이 확인할 부분을 분리해야 합니다.',
    '',
    '## 추천 실행 순서',
    '',
    bulletList(topic.workflow),
    '',
    '처음부터 완전 자동화를 목표로 잡지 않는 것이 중요합니다. 좋은 자동화는 사람이 하던 일을 없애는 것이 아니라, 사람이 판단해야 하는 지점만 남기고 나머지를 안정적으로 줄이는 방식에 가깝습니다.',
    '',
    '## 도구를 고르는 기준',
    '',
    buildComparisonTable(topic),
    '',
    `후보 도구로는 ${topic.toolCandidates.join(', ')} 등을 검토할 수 있습니다. 다만 특정 도구가 항상 정답은 아닙니다. 이미 쓰는 도구 안에서 해결되면 새 결제보다 기존 흐름을 정리하는 편이 더 낫습니다.`,
    '',
    '## 실패하기 쉬운 패턴',
    '',
    bulletList(topic.pitfalls),
    '',
    '특히 블로그나 고객 응대처럼 외부에 보이는 결과물은 자동 생성 후 바로 공개하지 않는 편이 안전합니다. 문장 톤, 사실 확인, 민감정보 여부를 사람이 마지막으로 확인해야 신뢰가 유지됩니다.',
    '',
    '## 바로 써볼 수 있는 체크리스트',
    '',
    '- 반복 빈도가 주 3회 이상인 업무인가?',
    '- 입력 자료가 매번 비슷한 형식으로 들어오는가?',
    '- 결과물을 사람이 3분 안에 검수할 수 있는가?',
    '- 실패했을 때 고객이나 매출에 직접 피해가 없는가?',
    '- 한 달 뒤에도 같은 방식으로 유지할 수 있는가?',
    '',
    '위 항목 중 네 개 이상에 답할 수 있으면 자동화 후보로 삼을 만합니다. 두 개 이하라면 먼저 업무 정의를 다시 하는 편이 좋습니다.',
    '',
    '## 자주 묻는 질문',
    '',
    ...topic.faq.flatMap(([question, answer]) => [`### ${question}`, '', answer, '']),
    '## 수익화 관점에서 보는 다음 단계',
    '',
    '이런 글은 단순 조회수보다 전환 의도가 중요합니다. 독자가 문제를 해결하는 과정에서 필요한 템플릿, 체크리스트, 도구 비교표, 컨설팅 문의로 자연스럽게 이어질 때 수익화가 가능합니다.',
    '',
    topic.cta,
  ].join('\n')
}

async function generateLlmBody(topic: TopicPlan) {
  const apiKey = process.env.CONTENT_LLM_API_KEY || process.env.OPENAI_API_KEY
  const model = process.env.CONTENT_LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  const baseUrl = (process.env.CONTENT_LLM_BASE_URL || 'https://api.openai.com/v1').replace(
    /\/$/,
    ''
  )

  if (!apiKey) {
    return ''
  }

  const prompt = [
    '한국어 블로그 글을 작성하십시오.',
    '조건:',
    '- AI가 만든 티가 나는 일반론을 피하고, 실제 운영자가 쓴 것처럼 구체적으로 씁니다.',
    '- 과장된 수익 보장, 광고 클릭 유도, 확인되지 않은 수치를 쓰지 않습니다.',
    '- 검색 의도, 실제 문제, 실행 순서, 실패 패턴, 체크리스트, FAQ, 수익화 관점 섹션을 모두 포함합니다.',
    '- Markdown으로 작성하고 제목은 H1 하나만 사용합니다.',
    '- 2500자 이상으로 작성합니다.',
    '',
    `제목: ${topic.title}`,
    `키워드: ${topic.keyword}`,
    `검색 의도: ${topic.intent}`,
    `독자: ${topic.audience}`,
    `문제: ${topic.painPoints.join(' / ')}`,
    `실행 순서: ${topic.workflow.join(' / ')}`,
    `도구 후보: ${topic.toolCandidates.join(', ')}`,
    `실패 패턴: ${topic.pitfalls.join(' / ')}`,
    `CTA: ${topic.cta}`,
  ].join('\n')

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior Korean editor writing helpful, people-first AI workflow articles.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.55,
      }),
    })
    if (!response.ok) {
      return ''
    }
    const data = (await response.json()) as ChatCompletionResponse
    return data.choices?.[0]?.message?.content?.trim() || ''
  } catch {
    return ''
  }
}

function scoreArticle(body: string) {
  let score = 0
  if (body.length >= 2400) score += 25
  if (body.includes('검색 의도')) score += 15
  if (body.includes('실패하기 쉬운 패턴')) score += 15
  if (body.includes('체크리스트')) score += 15
  if (body.includes('자주 묻는 질문')) score += 15
  if (body.includes('수익화 관점')) score += 15
  return score
}

async function recordQualityCheck(articleId: number, score: number, status: string) {
  await insertRow('quality_checks', {
    id: await nextId('quality_checks'),
    article_id: articleId,
    check_name: 'cloud_editorial_quality',
    status,
    severity: score >= 80 ? 'info' : 'warning',
    message: `Editorial quality score: ${score}. Required sections: search intent, pitfalls, checklist, FAQ, monetization CTA.`,
  })
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
  const topic = pickTopic()
  const slug = slugify(topic.title)
  const existing = await findBy<CloudArticle>(
    'articles',
    'slug',
    slug,
    'id,title,slug,status,created_at'
  )
  if (existing) {
    return { status: 'skipped', article: existing }
  }

  let keywordRow = await findBy<{ id: number }>('keywords', 'keyword', topic.keyword, 'id')
  if (!keywordRow) {
    keywordRow = await insertRow<{ id: number }>('keywords', {
      id: await nextId('keywords'),
      keyword: topic.keyword,
      source: 'vercel-cron-quality',
      language: 'ko',
      status: 'briefed',
      intent_score: 85,
      affiliate_score: 60,
      difficulty_score: 30,
      evergreen_score: 80,
      risk_score: 0,
      total_score: 95,
    })
  }

  const brief = await insertRow<{ id: number }>('content_briefs', {
    id: await nextId('content_briefs'),
    keyword_id: keywordRow.id,
    primary_intent: 'how_to',
    audience: topic.audience,
    title_options: [topic.title],
    outline: ['검색 의도', '실행 순서', '실패 패턴', '체크리스트', 'FAQ', '수익화 CTA'],
    evidence_needed: ['공식 문서 확인', '실제 적용 흐름 확인', '비용과 운영 난이도 비교'],
    cta_type: 'checklist',
    affiliate_candidates: topic.toolCandidates,
    status: 'drafted',
  })

  const body = (await generateLlmBody(topic)) || buildBody(topic)
  const qualityScore = scoreArticle(body)
  const articleStatus = qualityScore >= 75 ? 'approved' : 'draft'
  const article = await insertRow<CloudArticle>('articles', {
    id: await nextId('articles'),
    brief_id: brief.id,
    language: 'ko',
    title: topic.title,
    slug,
    meta_description: `${topic.keyword}를 실제 업무에 적용하기 위한 기준, 실행 순서, 실패 포인트를 정리한 실전 가이드입니다.`,
    body_markdown: body,
    status: articleStatus,
    needs_english_expansion: false,
  })
  await recordQualityCheck(
    article.id,
    qualityScore,
    articleStatus === 'approved' ? 'passed' : 'needs_review'
  )

  return { status: articleStatus === 'approved' ? 'created' : 'drafted', qualityScore, article }
}
