import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { listCloudArticleSitemapEntries } from '@/lib/supabaseContent'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  let cloudBlogRoutes: MetadataRoute.Sitemap = []
  try {
    const cloudArticles = await listCloudArticleSitemapEntries()
    cloudBlogRoutes = cloudArticles.map((post) => ({
      url: `${siteUrl}/cloud-blog/${post.slug}`,
      lastModified: post.created_at,
    }))
  } catch {
    cloudBlogRoutes = []
  }

  const routes = ['', 'blog', 'cloud-blog', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes, ...cloudBlogRoutes]
}
