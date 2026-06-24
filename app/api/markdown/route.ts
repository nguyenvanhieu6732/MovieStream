import { NextResponse } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * Markdown content negotiation endpoint.
 *
 * When an AI agent requests a page with Accept: text/markdown,
 * this endpoint returns a clean markdown representation of that page.
 *
 * Usage: GET /api/markdown?path=/movie/some-slug
 *        Accept: text/markdown
 *
 * This is also referenced in Link headers via:
 *   rel="alternate"; type="text/markdown"
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path") || "/"

  // Sanitize path
  const safePath = path.startsWith("/") ? path : `/${path}`

  // Block private paths
  const privatePaths = ["/api/admin", "/system", "/profile", "/watchlist"]
  if (privatePaths.some((p) => safePath.startsWith(p))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Generate markdown based on path type
  let markdown = ""

  if (safePath === "/" || safePath === "/home") {
    markdown = `# MovieStream

> Stream the latest movies and TV shows online.

## What is MovieStream?

MovieStream is a streaming platform offering thousands of movies and TV series. 
Browse by genre, search by title, and watch in HD quality.

## Popular Sections

- **[Latest Movies](${siteUrl}/movies)** — Browse recently updated content
- **[Search](${siteUrl}/search)** — Find any movie or series
- **[Watchlist](${siteUrl}/watchlist)** — Your saved content (requires login)

## API Access

Developers and AI agents can access MovieStream's content programmatically:

- **Search API**: \`GET ${siteUrl}/api/search?keyword={query}\`
- **Movie Catalog**: \`GET ${siteUrl}/api/posts\`
- **API Spec**: \`GET ${siteUrl}/.well-known/openapi.json\`
- **API Catalog**: \`GET ${siteUrl}/.well-known/api-catalog\`
- **Agent Skills**: \`GET ${siteUrl}/.well-known/agent-skills\`
- **MCP Server**: \`POST ${siteUrl}/api/mcp\`

## Authentication

See [Authentication Guide](${siteUrl}/auth.md) for OAuth and credential requirements.
`
  } else if (safePath.startsWith("/movie/")) {
    const slug = safePath.replace("/movie/", "")
    try {
      const OPHIM_API = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api"
      const res = await fetch(`${OPHIM_API}/phim/${slug}`, {
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const json = await res.json()
        const movie = json?.data?.item
        if (movie) {
          markdown = `# ${movie.name}

**Original Title**: ${movie.origin_name || "N/A"}
**Year**: ${movie.year || "N/A"}
**Type**: ${movie.type === "series" ? "TV Series" : "Movie"}
**Status**: ${movie.episode_current || "N/A"}
**Language**: ${movie.lang || "N/A"}
**Quality**: ${movie.quality || "N/A"}

## Synopsis

${movie.content || "No synopsis available."}

## Categories

${(movie.category || []).map((c: { name: string }) => `- ${c.name}`).join("\n")}

## Cast & Crew

**Director**: ${(movie.director || []).join(", ") || "N/A"}
**Actors**: ${(movie.actor || []).join(", ") || "N/A"}

## Streaming

[Watch Now](${siteUrl}/watch/${slug})

## Poster

![${movie.name}](${movie.poster_url || movie.thumb_url || ""})
`
        }
      }
    } catch {
      // Fallback
    }

    if (!markdown) {
      markdown = `# Movie: ${slug}

[View this movie on MovieStream](${siteUrl}/movie/${slug})
[Watch Now](${siteUrl}/watch/${slug})
`
    }
  } else if (safePath === "/movies") {
    markdown = `# MovieStream — Movie Catalog

Browse the full MovieStream catalog at [${siteUrl}/movies](${siteUrl}/movies).

## API Access

Get movies programmatically:

\`\`\`
GET ${siteUrl}/api/posts?page=1
\`\`\`

Returns JSON with movie listings and pagination.
`
  } else if (safePath === "/search") {
    markdown = `# MovieStream — Search

Search the full catalog at [${siteUrl}/search](${siteUrl}/search).

## API Access

\`\`\`
GET ${siteUrl}/api/search?keyword={your+query}
\`\`\`
`
  } else {
    markdown = `# MovieStream

[Visit MovieStream](${siteUrl}${safePath})

This page is available at: ${siteUrl}${safePath}
`
  }

  const tokens = Math.ceil(markdown.length / 4)

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Link": `<${siteUrl}${safePath}>; rel="canonical"`,
      "x-markdown-tokens": tokens.toString(),
    },
  })
}
