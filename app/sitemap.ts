import type { MetadataRoute } from "next"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * Dynamic sitemap following sitemaps.org protocol.
 * Includes all canonical public URLs.
 * Static routes are listed explicitly; dynamic movie/watch routes
 * could be extended here by fetching from the OPHIM API.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/movies`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ]

  // Attempt to fetch a page of movies from the OPHIM API for dynamic URLs
  let dynamicRoutes: MetadataRoute.Sitemap = []
  try {
    const OPHIM_API =
      process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api"
    const res = await fetch(`${OPHIM_API}/danh-sach/phim-moi-cap-nhat?page=1`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const json = await res.json()
      const items: Array<{ slug: string; modified?: { time: string } }> =
        json?.data?.items || []

      dynamicRoutes = items.map((item) => ({
        url: `${siteUrl}/movie/${item.slug}`,
        lastModified: item.modified?.time ? new Date(item.modified.time) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Fallback: only static routes are included if API is unavailable
  }

  return [...staticRoutes, ...dynamicRoutes]
}
