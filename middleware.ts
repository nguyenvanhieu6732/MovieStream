import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

// ─── RFC 8288 Link Headers ────────────────────────────────────────────────────
const RFC8288_LINKS = [
  `<${siteUrl}/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
  `<${siteUrl}/.well-known/openapi.json>; rel="service-desc"; type="application/openapi+json"`,
  `<${siteUrl}/auth.md>; rel="service-doc"; type="text/markdown"`,
  `<${siteUrl}/.well-known/openid-configuration>; rel="openid-configuration"`,
  `<${siteUrl}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
].join(", ")

// ─── Content-Signal (AI policy) ───────────────────────────────────────────────
const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=no"

// ─── Routes yêu cầu đăng nhập ────────────────────────────────────────────────
const AUTH_REQUIRED = ["/profile", "/watchlist"]

// ─── Routes công khai cần inject Link headers ─────────────────────────────────
const PUBLIC_LINK_PREFIXES = ["/", "/home", "/movies", "/movie", "/search", "/watch"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Kiểm tra auth cho các route yêu cầu đăng nhập
  const needsAuth = AUTH_REQUIRED.some((p) => pathname.startsWith(p))
  if (needsAuth) {
    const token = await getToken({ req: request })
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Tạo response và inject AI-Agent headers
  const response = NextResponse.next()

  // Content-Signal trên tất cả responses
  response.headers.set("Content-Signal", CONTENT_SIGNAL)

  // RFC 8288 Link headers trên các trang công khai
  const isPublicPage =
    pathname === "/" ||
    PUBLIC_LINK_PREFIXES.some((p) => p !== "/" && pathname.startsWith(p))

  if (isPublicPage) {
    response.headers.set("Link", RFC8288_LINKS)
  }

  // CORS cho .well-known, API, và discovery routes
  if (
    pathname.startsWith("/.well-known") ||
    pathname.startsWith("/api/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/auth.md"
  ) {
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
  }

  // X-Robots-Tag cho các trang private
  if (
    pathname.startsWith("/profile") ||
    pathname.startsWith("/watchlist") ||
    pathname.startsWith("/system") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
  }

  return response
}

export const config = {
  matcher: [
    // Auth-protected routes
    "/profile/:path*",
    "/watchlist/:path*",
    // Public routes (header injection)
    "/",
    "/home/:path*",
    "/movies/:path*",
    "/movie/:path*",
    "/search/:path*",
    "/watch/:path*",
    // Discovery routes
    "/.well-known/:path*",
    "/auth.md",
    "/sitemap.xml",
    "/robots.txt",
    // API routes (CORS)
    "/api/:path*",
  ],
}
