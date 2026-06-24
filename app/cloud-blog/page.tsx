import Link from '@/components/Link'
import { listCloudArticles } from '@/lib/supabaseContent'

export const dynamic = 'force-dynamic'

export default async function CloudBlogPage() {
  const posts = await listCloudArticles()

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-semibold tracking-tight text-gray-950 sm:text-4xl sm:leading-10 dark:text-gray-100">
          Cloud Blog
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Supabase에 저장되고 Vercel에서 자동 생성되는 글입니다.
        </p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {!posts.length && <li className="py-12 text-gray-500">아직 Supabase 글이 없습니다.</li>}
        {posts.map((post) => (
          <li key={post.id} className="py-10">
            <article className="space-y-3">
              <time className="text-sm text-gray-500" dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('ko-KR')}
              </time>
              <h2 className="text-2xl font-semibold tracking-tight">
                <Link
                  href={`/cloud-blog/${post.slug}`}
                  className="text-gray-950 dark:text-gray-100"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{post.meta_description}</p>
              <Link
                href={`/cloud-blog/${post.slug}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                계속 읽기 &rarr;
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
