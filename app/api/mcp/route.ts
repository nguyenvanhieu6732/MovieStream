import { NextResponse } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * MCP HTTP endpoint.
 * Handles JSON-RPC style MCP requests from AI agents.
 * 
 * This is referenced by /.well-known/mcp/server-card.json
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { method, params, id } = body

    switch (method) {
      case "tools/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: [
              {
                name: "search_movies",
                description:
                  "Search MovieStream's catalog by keyword. Returns movie/series titles, slugs, thumbnails, and metadata.",
                inputSchema: {
                  type: "object",
                  properties: {
                    keyword: {
                      type: "string",
                      description: "Search term for movie or series title",
                    },
                  },
                  required: ["keyword"],
                },
              },
              {
                name: "get_movie_details",
                description:
                  "Retrieve full metadata for a specific movie or series by slug.",
                inputSchema: {
                  type: "object",
                  properties: {
                    slug: {
                      type: "string",
                      description: "Movie or series slug identifier",
                    },
                  },
                  required: ["slug"],
                },
              },
              {
                name: "get_trending",
                description: "Retrieve the current trending movies and series.",
                inputSchema: {
                  type: "object",
                  properties: {
                    limit: {
                      type: "integer",
                      default: 10,
                    },
                  },
                },
              },
            ],
          },
        })
      }

      case "tools/call": {
        const { name, arguments: args } = params || {}

        if (name === "search_movies") {
          const keyword = args?.keyword || ""
          const OPHIM_API = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api"
          const res = await fetch(
            `${OPHIM_API}/tim-kiem?keyword=${encodeURIComponent(keyword)}`,
            { next: { revalidate: 300 } }
          )
          const json = await res.json()
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(json?.data?.items || [], null, 2),
                },
              ],
            },
          })
        }

        if (name === "get_trending") {
          const OPHIM_API = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api"
          const limit = Math.min(Number(args?.limit) || 10, 50)
          const res = await fetch(
            `${OPHIM_API}/danh-sach/phim-moi-cap-nhat?page=1`,
            { next: { revalidate: 300 } }
          )
          const json = await res.json()
          const items = (json?.data?.items || []).slice(0, limit)
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(items, null, 2),
                },
              ],
            },
          })
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Tool not found: ${name}` },
        })
      }

      case "resources/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            resources: [
              {
                uri: `${siteUrl}/api/search`,
                name: "movie_search",
                description: "Full-text search over the movie catalog",
                mimeType: "application/json",
              },
              {
                uri: `${siteUrl}/api/posts`,
                name: "movie_catalog",
                description: "Paginated movie catalog",
                mimeType: "application/json",
              },
            ],
          },
        })
      }

      case "initialize": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              resources: {},
            },
            serverInfo: {
              name: "MovieStream MCP Server",
              version: "1.0.0",
            },
          },
        })
      }

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        })
    }
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      name: "MovieStream MCP Server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      serverCard: `${siteUrl}/.well-known/mcp/server-card`,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Session-Id",
    },
  })
}
