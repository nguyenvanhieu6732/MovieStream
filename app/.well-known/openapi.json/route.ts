import { NextResponse } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * OpenAPI 3.1 specification for MovieStream's public API.
 * Referenced by the API Catalog and Agent Skills index.
 */
export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "MovieStream API",
      version: "1.0.0",
      description:
        "Public API for MovieStream — search movies, browse the catalog, manage watchlists, and interact with community features.",
      contact: {
        name: "MovieStream Support",
        url: siteUrl,
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: `${siteUrl}/api`,
        description: "Production API",
      },
    ],
    paths: {
      "/search": {
        get: {
          operationId: "searchMovies",
          summary: "Search movies and series",
          description:
            "Full-text search over the MovieStream catalog. Returns matching movies and TV series with titles, slugs, and poster images.",
          tags: ["Discovery"],
          parameters: [
            {
              name: "keyword",
              in: "query",
              required: true,
              description: "Search keyword",
              schema: { type: "string", minLength: 1 },
            },
          ],
          responses: {
            "200": {
              description: "Search results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/MovieSummary",
                        },
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
            },
          },
        },
      },
      "/posts": {
        get: {
          operationId: "listMovies",
          summary: "List movies and series",
          description: "Paginated list of movies and series from the catalog.",
          tags: ["Discovery"],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
            {
              name: "type",
              in: "query",
              schema: {
                type: "string",
                enum: ["movie", "series", "all"],
                default: "all",
              },
              description: "Content type filter",
            },
          ],
          responses: {
            "200": {
              description: "Movie list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/MovieSummary" },
                      },
                      pagination: {
                        $ref: "#/components/schemas/Pagination",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/watchlist": {
        get: {
          operationId: "getWatchlist",
          summary: "Get user watchlist",
          description: "Returns the authenticated user's watchlist.",
          tags: ["User"],
          security: [{ SessionAuth: ["watchlist:read"] }],
          responses: {
            "200": {
              description: "User watchlist",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      watchlist: {
                        type: "array",
                        items: { $ref: "#/components/schemas/WatchlistItem" },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          operationId: "addToWatchlist",
          summary: "Add to watchlist",
          description: "Add a movie or series to the user's watchlist.",
          tags: ["User"],
          security: [{ SessionAuth: ["watchlist:write"] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    movieId: { type: "string" },
                  },
                  required: ["movieId"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Added successfully" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/status": {
        get: {
          operationId: "getStatus",
          summary: "API health status",
          description: "Returns the current health status of the MovieStream API.",
          tags: ["System"],
          responses: {
            "200": {
              description: "API is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", enum: ["ok", "degraded", "down"] },
                      version: { type: "string" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/comments": {
        get: {
          operationId: "getComments",
          summary: "Get movie comments",
          description: "Returns comments for a specific movie or series.",
          tags: ["Community"],
          parameters: [
            {
              name: "movieId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Comments list" },
          },
        },
      },
    },
    components: {
      schemas: {
        MovieSummary: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", description: "Movie title" },
            slug: { type: "string", description: "URL-friendly identifier" },
            origin_name: { type: "string", description: "Original title" },
            thumb_url: { type: "string", format: "uri", description: "Thumbnail image URL" },
            poster_url: { type: "string", format: "uri", description: "Poster image URL" },
            year: { type: "integer", description: "Release year" },
            type: { type: "string", enum: ["movie", "series"] },
            category: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            totalPages: { type: "integer" },
            totalItems: { type: "integer" },
          },
        },
        WatchlistItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            movieId: { type: "string" },
            movieName: { type: "string" },
            movieSlug: { type: "string" },
            addedAt: { type: "string", format: "date-time" },
          },
        },
      },
      securitySchemes: {
        SessionAuth: {
          type: "http",
          scheme: "bearer",
          description:
            "NextAuth.js session token. Obtain via POST /api/auth/signin with credentials.",
        },
      },
    },
    tags: [
      { name: "Discovery", description: "Browse and search the content catalog" },
      { name: "User", description: "Authenticated user operations" },
      { name: "Community", description: "Comments and social features" },
      { name: "System", description: "System health and metadata" },
    ],
  }

  return NextResponse.json(spec, {
    status: 200,
    headers: {
      "Content-Type": "application/openapi+json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
