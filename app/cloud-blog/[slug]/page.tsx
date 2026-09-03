import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import siteMetadata from '@/data/siteMetadata'
import { getCloudArticle } from '@/lib/supabaseContent'

export const dynamic = 'force-dynamic'

type MarkdownBlockModel =
  | { type: 'heading1'; text: string }
  | { type: 'heading2'; text: string }
  | { type: 'heading3'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'spacer' }

type FaqEntry = {
  question: string
  answer: string
}

function parseMarkdown(markdown: string): MarkdownBlockModel[] {
  const lines = markdown.split('\n')
  const blocks: MarkdownBlockModel[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()

    if (!trimmed) {
      blocks.push({ type: 'spacer' })
      continue
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const rows: string[][] = []
      while (index < lines.length) {
        const tableLine = lines[index].trim()
        if (!tableLine.startsWith('|') || !tableLine.endsWith('|')) break
        rows.push(
          tableLine
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim())
        )
        index += 1
      }
      index -= 1
      blocks.push({ type: 'table', rows })
      continue
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = []
      while (index < lines.length) {
        const itemLine = lines[index].trim()
        if (!itemLine.startsWith('- ')) break
        items.push(itemLine.slice(2))
        index += 1
      }
      index -= 1
      blocks.push({ type: 'list', items })
      continue
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'heading1', text: trimmed.slice(2) })
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading2', text: trimmed.slice(3) })
      continue
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading3', text: trimmed.slice(4) })
      continue
    }

    blocks.push({ type: 'paragraph', text: trimmed })
  }

  return blocks
}

function extractFaq(markdown: string): FaqEntry[] {
  const lines = markdown.split('\n')
  const faqStart = lines.findIndex((line) => line.trim() === '## 자주 묻는 질문')
  if (faqStart === -1) return []

  const entries: FaqEntry[] = []
  for (let index = faqStart + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line.startsWith('## ') && line !== '## 자주 묻는 질문') break
    if (!line.startsWith('### ')) continue

    const question = line.slice(4)
    const answerLines: string[] = []
    index += 1
    while (index < lines.length) {
      const answerLine = lines[index].trim()
      if (answerLine.startsWith('### ') || answerLine.startsWith('## ')) {
        index -= 1
        break
      }
      if (answerLine) answerLines.push(answerLine)
      index += 1
    }

    if (question && answerLines.length) {
      entries.push({ question, answer: answerLines.join(' ') })
    }
  }

  return entries
}

function MarkdownBlock({ block }: { block: MarkdownBlockModel }) {
  if (block.type === 'heading1') {
    return <h1 className="mt-2 mb-8 text-4xl font-semibold tracking-tight">{block.text}</h1>
  }
  if (block.type === 'heading2') {
    return <h2 className="mt-10 mb-4 text-2xl font-semibold tracking-tight">{block.text}</h2>
  }
  if (block.type === 'heading3') {
    return <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight">{block.text}</h3>
  }
  if (block.type === 'list') {
    return (
      <ul className="my-5 list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }
  if (block.type === 'table') {
    const [header, ...rows] = block.rows
    if (!header) return null

    return (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              {header.map((cell) => (
                <th key={cell} className="border-b border-gray-200 px-3 py-2 font-semibold">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)))
              .map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell) => (
                    <td key={cell} className="border-b border-gray-100 px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )
  }
  if (block.type === 'spacer') {
    return <div className="h-3" />
  }
  return <p className="leading-8 text-gray-700 dark:text-gray-300">{block.text}</p>
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getCloudArticle(decodeURIComponent(slug))

  if (!post) {
    return {
      title: '글을 찾을 수 없습니다',
      robots: { index: false, follow: false },
    }
  }

  const url = `${siteMetadata.siteUrl}/cloud-blog/${post.slug}`
  return {
    title: post.title,
    description: post.meta_description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.meta_description,
      siteName: siteMetadata.title,
      locale: 'ko_KR',
      type: 'article',
      publishedTime: new Date(post.created_at).toISOString(),
      modifiedTime: new Date(post.created_at).toISOString(),
      url,
      images: [siteMetadata.socialBanner],
      authors: [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description,
      images: [siteMetadata.socialBanner],
    },
  }
}

function createStructuredData(post: NonNullable<Awaited<ReturnType<typeof getCloudArticle>>>) {
  const url = `${siteMetadata.siteUrl}/cloud-blog/${post.slug}`
  const imageUrl = siteMetadata.socialBanner.startsWith('http')
    ? siteMetadata.socialBanner
    : `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`
  const faqEntries = extractFaq(post.body_markdown)
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.meta_description,
      datePublished: post.created_at,
      dateModified: post.created_at,
      inLanguage: 'ko-KR',
      author: {
        '@type': 'Person',
        name: siteMetadata.author,
        url: siteMetadata.siteUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: siteMetadata.title,
        url: siteMetadata.siteUrl,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      image: imageUrl,
      url,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteMetadata.siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Cloud Blog',
          item: `${siteMetadata.siteUrl}/cloud-blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: url,
        },
      ],
    },
  ]

  if (faqEntries.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqEntries.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: entry.answer,
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export default async function CloudPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const post = await getCloudArticle(decodeURIComponent(slug))

  if (!post) {
    notFound()
  }

  const blocks = parseMarkdown(post.body_markdown)
  const structuredData = createStructuredData(post)

  return (
    <article className="mx-auto max-w-3xl py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <time className="text-sm text-gray-500" dateTime={post.created_at}>
        {new Date(post.created_at).toLocaleDateString('ko-KR')}
      </time>
      <div className="mt-4 space-y-1">
        {blocks.map((block, index) => (
          <MarkdownBlock key={`${index}-${block.type}`} block={block} />
        ))}
      </div>
    </article>
  )
}
