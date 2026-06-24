import { NextResponse } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export async function GET() {
  const content = `User-agent: *
Allow: /
Allow: /home
Allow: /movies
Allow: /movie/
Allow: /search
Allow: /watch/
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /api/user/
Disallow: /api/premium/
Disallow: /api/premium-check/
Disallow: /api/profile/
Disallow: /watchlist/
Disallow: /system/
Disallow: /profile/
Disallow: /login
Disallow: /register
Disallow: /_next/
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: GPTBot
Allow: /
Allow: /home
Allow: /movies
Allow: /movie/
Allow: /search
Disallow: /api/
Disallow: /system/
Disallow: /profile/
Disallow: /watchlist/
Disallow: /login
Disallow: /register
Disallow: /watch/
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: OAI-SearchBot
Allow: /
Allow: /home
Allow: /movies
Allow: /movie/
Allow: /search
Disallow: /api/
Disallow: /system/
Disallow: /profile/
Disallow: /watchlist/
Disallow: /login
Disallow: /register
Disallow: /watch/
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: Claude-Web
Allow: /
Allow: /home
Allow: /movies
Allow: /movie/
Allow: /search
Disallow: /api/
Disallow: /system/
Disallow: /profile/
Disallow: /watchlist/
Disallow: /login
Disallow: /register
Disallow: /watch/
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: Google-Extended
Allow: /
Allow: /home
Allow: /movies
Allow: /movie/
Allow: /search
Disallow: /api/
Disallow: /system/
Disallow: /profile/
Disallow: /watchlist/
Disallow: /login
Disallow: /register
Disallow: /watch/
Content-Signal: ai-train=no, search=yes, ai-input=no

Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}
`
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
