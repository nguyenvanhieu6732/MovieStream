import { NextResponse } from "next/server"
import crypto from "crypto"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * Agent Skills Discovery Index
 * Follows Agent Skills Discovery RFC draft.
 *
 * Lists all skills this application exposes for AI agents,
 * including name, type, description, URL, and SHA-256 digest.
 */
export async function GET() {
  // Skills definitions
  const skills = [
    {
      name: "search-movies",
      type: "api",
      description:
        "Search the MovieStream catalog by keyword. Returns movie/series titles, slugs, thumbnails, and metadata. No authentication required.",
      url: `${siteUrl}/api/search`,
      method: "GET",
      parameters: {
        keyword: { type: "string", required: true, description: "Search keyword" },
      },
      examples: [
        {
          description: "Search for action movies",
          url: `${siteUrl}/api/search?keyword=action`,
        },
      ],
    },
    {
      name: "browse-movies",
      type: "api",
      description:
        "Browse and filter the full MovieStream movie catalog with pagination support. No authentication required.",
      url: `${siteUrl}/api/posts`,
      method: "GET",
      parameters: {
        page: { type: "integer", required: false, description: "Page number (default: 1)" },
        type: { type: "string", required: false, description: "Content type: movie or series" },
      },
      examples: [
        {
          description: "Browse first page of movies",
          url: `${siteUrl}/api/posts?page=1`,
        },
      ],
    },
    {
      name: "manage-watchlist",
      type: "api",
      description:
        "Read, add, or remove movies from the authenticated user's watchlist. Requires authentication with scope watchlist:read or watchlist:write.",
      url: `${siteUrl}/api/watchlist`,
      method: "GET,POST,DELETE",
      authentication: {
        required: true,
        scopes: ["watchlist:read", "watchlist:write"],
      },
    },
    {
      name: "movie-comments",
      type: "api",
      description:
        "Read and post comments on movies. Reading is public; posting requires authentication with comments:write scope.",
      url: `${siteUrl}/api/comments`,
      method: "GET,POST",
      authentication: {
        required: false,
        scopes: ["comments:read", "comments:write"],
      },
    },
    {
      name: "stream-movie",
      type: "page",
      description:
        "Navigate to the MovieStream watch page for a specific movie or episode by slug.",
      url: `${siteUrl}/watch/{slug}`,
      urlTemplate: true,
      parameters: {
        slug: { type: "string", required: true, description: "Movie or episode slug" },
      },
    },
    {
      name: "movie-detail-page",
      type: "page",
      description:
        "Navigate to the full detail page for a movie including synopsis, cast, and episode list.",
      url: `${siteUrl}/movie/{slug}`,
      urlTemplate: true,
      parameters: {
        slug: { type: "string", required: true, description: "Movie slug" },
      },
    },
  ]

  // Compute SHA-256 digests for each skill URL (for integrity verification)
  const skillsWithDigest = skills.map((skill) => ({
    ...skill,
    sha256: crypto.createHash("sha256").update(skill.url).digest("hex"),
  }))

  const index = {
    $schema:
      "https://agentskills.dev/schema/v1/index.json",
    version: "1.0",
    name: "MovieStream Agent Skills",
    description:
      "Skills and API endpoints exposed by MovieStream for AI agent integration. Includes movie search, catalog browsing, watchlist management, and streaming navigation.",
    homepage: siteUrl,
    skills: skillsWithDigest,
    updated: new Date().toISOString(),
  }

  return NextResponse.json(index, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
