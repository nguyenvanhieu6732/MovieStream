import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const host = request.headers.get("host") || new URL(request.url).host
  const protocol = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https") ? "https" : "http")
  const siteUrl = `${protocol}://${host}`

  const serverCard = {
    schemaVersion: "1.0",
    serverInfo: {
      name: "MovieStream MCP Server",
      version: "1.0.0",
      description:
        "Provides AI agents with structured access to MovieStream content: search movies, fetch details, manage watchlists, and retrieve streaming metadata.",
      homepage: siteUrl,
      contact: "support@moviestream.app",
    },

    // Transport endpoints
    transport: [
      {
        type: "http",
        endpoint: `${siteUrl}/api/mcp`,
        protocol: "mcp/1.0",
      },
    ],

    // Capabilities exposed by this MCP server
    capabilities: {
      tools: [
        {
          name: "search_movies",
          description:
            "Search MovieStream's catalog by keyword, genre, year, or type (series/movie).",
          inputSchema: {
            type: "object",
            properties: {
              keyword: {
                type: "string",
                description: "Search term for movie or series title",
              },
              type: {
                type: "string",
                enum: ["movie", "series"],
                description: "Filter by content type",
              },
              year: {
                type: "integer",
                description: "Release year filter",
              },
            },
            required: ["keyword"],
          },
        },
        {
          name: "get_movie_details",
          description:
            "Retrieve full metadata for a specific movie or series by slug, including cast, synopsis, and available episodes.",
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
          name: "get_watchlist",
          description:
            "Retrieve the authenticated user's watchlist. Requires authentication scope watchlist:read.",
          inputSchema: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                description: "User ID (optional, defaults to authenticated user)",
              },
            },
          },
        },
        {
          name: "add_to_watchlist",
          description:
            "Add a movie or series to the authenticated user's watchlist. Requires scope watchlist:write.",
          inputSchema: {
            type: "object",
            properties: {
              movieId: {
                type: "string",
                description: "Movie or series ID to add",
              },
            },
            required: ["movieId"],
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
                description: "Number of results to return",
              },
            },
          },
        },
      ],

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
          description: "Paginated movie catalog with filter support",
          mimeType: "application/json",
        },
      ],

      prompts: [
        {
          name: "recommend_movies",
          description:
            "Generate movie recommendations based on user preferences and viewing history.",
          arguments: [
            {
              name: "genre",
              description: "Preferred genre",
              required: false,
            },
            {
              name: "mood",
              description: "Current viewer mood (e.g., action, relaxing, thriller)",
              required: false,
            },
          ],
        },
      ],
    },

    // Authentication requirements
    authentication: {
      required: false,
      optional: true,
      methods: ["oauth2", "session"],
      oauth2: {
        authorizationServer: siteUrl,
        scopes: {
          "watchlist:read": "Read user watchlist",
          "watchlist:write": "Add/remove items from watchlist",
          "comments:read": "Read comments",
          "comments:write": "Post and manage comments",
        },
      },
    },
  }

  return NextResponse.json(serverCard, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
