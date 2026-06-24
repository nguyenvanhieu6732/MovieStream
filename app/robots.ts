import type { MetadataRoute } from "next"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow public pages, block private routes
      {
        userAgent: "*",
        allow: ["/", "/home", "/movies", "/movie/", "/search", "/watch/"],
        disallow: [
          "/api/admin/",
          "/api/auth/",
          "/api/user/",
          "/api/premium/",
          "/api/premium-check/",
          "/api/profile/",
          "/api/watchlist/",
          "/system/",
          "/profile/",
          "/watchlist/",
          "/login",
          "/register",
          "/_next/",
        ],
      },
      // OpenAI GPTBot
      {
        userAgent: "GPTBot",
        allow: ["/", "/home", "/movies", "/movie/", "/search"],
        disallow: [
          "/api/",
          "/system/",
          "/profile/",
          "/watchlist/",
          "/login",
          "/register",
          "/watch/",
        ],
      },
      // OpenAI SearchBot
      {
        userAgent: "OAI-SearchBot",
        allow: ["/", "/home", "/movies", "/movie/", "/search"],
        disallow: [
          "/api/",
          "/system/",
          "/profile/",
          "/watchlist/",
          "/login",
          "/register",
          "/watch/",
        ],
      },
      // Anthropic Claude
      {
        userAgent: "Claude-Web",
        allow: ["/", "/home", "/movies", "/movie/", "/search"],
        disallow: [
          "/api/",
          "/system/",
          "/profile/",
          "/watchlist/",
          "/login",
          "/register",
          "/watch/",
        ],
      },
      // Google Extended (AI training)
      {
        userAgent: "Google-Extended",
        allow: ["/", "/home", "/movies", "/movie/", "/search"],
        disallow: [
          "/api/",
          "/system/",
          "/profile/",
          "/watchlist/",
          "/login",
          "/register",
          "/watch/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    // Content-Signal directives (non-standard extension, appended as host comment)
    // Content-Signal: ai-train=no, search=yes, ai-input=no
    // Note: Next.js MetadataRoute.Robots doesn't support raw directives,
    // so this is handled via a custom header in middleware.ts
    host: siteUrl,
  }
}
