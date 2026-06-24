import { NextResponse } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * RFC 9727 API Catalog
 * Content-Type: application/linkset+json
 * Describes all public API endpoints for AI agents and API discovery tools.
 */
export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: `${siteUrl}/api`,
        // OpenAPI / service description
        "service-desc": [
          {
            href: `${siteUrl}/.well-known/openapi.json`,
            type: "application/openapi+json",
          },
        ],
        // Human-readable documentation
        "service-doc": [
          {
            href: `${siteUrl}/auth.md`,
            type: "text/markdown",
          },
        ],
        // API status endpoint
        status: [
          {
            href: `${siteUrl}/api/status`,
          },
        ],
        // API root
        self: [
          {
            href: `${siteUrl}/api`,
          },
        ],
      },
      // Search API
      {
        anchor: `${siteUrl}/api/search`,
        "service-doc": [
          {
            href: `${siteUrl}/.well-known/openapi.json#/paths/~1api~1search`,
            type: "application/openapi+json",
          },
        ],
        describedby: [
          {
            href: `${siteUrl}/.well-known/openapi.json`,
            type: "application/openapi+json",
          },
        ],
      },
      // Movies / Posts API
      {
        anchor: `${siteUrl}/api/posts`,
        "service-doc": [
          {
            href: `${siteUrl}/.well-known/openapi.json#/paths/~1api~1posts`,
            type: "application/openapi+json",
          },
        ],
        describedby: [
          {
            href: `${siteUrl}/.well-known/openapi.json`,
            type: "application/openapi+json",
          },
        ],
      },
    ],
  }

  return NextResponse.json(catalog, {
    status: 200,
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
