import { notFound } from 'next/navigation'

import { getCloudArticle } from '@/lib/supabaseContent'

export const dynamic = 'force-dynamic'

function MarkdownBlock({ line }: { line: string }) {
  if (line.startsWith('# ')) {
    return <h1 className="mt-2 mb-8 text-4xl font-semibold tracking-tight">{line.slice(2)}</h1>
  }
  if (line.startsWith('## ')) {
    return <h2 className="mt-10 mb-4 text-2xl font-semibold tracking-tight">{line.slice(3)}</h2>
  }
  if (line.startsWith('- ')) {
    return <li className="ml-6 list-disc text-gray-700 dark:text-gray-300">{line.slice(2)}</li>
  }
  if (!line.trim()) {
    return <div className="h-3" />
  }
  return <p className="leading-8 text-gray-700 dark:text-gray-300">{line}</p>
}

export default async function CloudPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const post = await getCloudArticle(decodeURIComponent(slug))

  if (!post || post.status !== 'approved') {
    notFound()
  }

  return (
    <article className="mx-auto max-w-3xl py-10">
      <time className="text-sm text-gray-500" dateTime={post.created_at}>
        {new Date(post.created_at).toLocaleDateString('ko-KR')}
      </time>
      <div className="mt-4 space-y-1">
        {post.body_markdown.split('\n').map((line, index) => (
          <MarkdownBlock key={`${index}-${line}`} line={line} />
        ))}
      </div>
    </article>
  )
}
