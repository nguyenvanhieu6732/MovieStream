import { NextResponse } from "next/server"

/**
 * API Health/Status endpoint.
 * Referenced in the API Catalog and OpenAPI spec.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "MovieStream API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        search: "/api/search",
        posts: "/api/posts",
        watchlist: "/api/watchlist",
        comments: "/api/comments",
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    }
  )
}
