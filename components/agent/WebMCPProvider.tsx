"use client"

import { useEffect } from "react"

/**
 * WebMCP Tool Registration
 *
 * Registers MovieStream's key actions as tools in the browser's
 * Model Context Protocol (navigator.modelContext) when available.
 *
 * Follows the current WebMCP specification draft.
 * Each tool has: name, description, inputSchema, and execute callback.
 */

interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, { type: string; description: string }>
    required?: string[]
  }
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

interface ModelContext {
  registerTool: (tool: MCPTool) => void
  unregisterTool?: (name: string) => void
}

declare global {
  interface Navigator {
    modelContext?: ModelContext
  }
}

export function WebMCPProvider() {
  useEffect(() => {
    // Check for WebMCP support
    if (typeof window === "undefined" || !navigator.modelContext) {
      return
    }

    const mc = navigator.modelContext

    // Define all MovieStream key tools
    const tools: MCPTool[] = [
      {
        name: "moviestream_search",
        description:
          "Search the MovieStream catalog for movies and TV series. Returns titles, slugs, poster images, and metadata.",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Search keyword — movie title, actor, genre, etc.",
            },
          },
          required: ["keyword"],
        },
        execute: async ({ keyword }) => {
          const res = await fetch(
            `/api/search?keyword=${encodeURIComponent(String(keyword))}`
          )
          if (!res.ok) throw new Error("Search failed")
          return res.json()
        },
      },
      {
        name: "moviestream_navigate_to_movie",
        description:
          "Navigate the browser to a specific movie's detail page on MovieStream.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "The movie or series URL slug",
            },
          },
          required: ["slug"],
        },
        execute: async ({ slug }) => {
          window.location.href = `/movie/${slug}`
          return { navigated: true, url: `/movie/${slug}` }
        },
      },
      {
        name: "moviestream_watch",
        description:
          "Open the MovieStream video player for a specific movie or episode.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Movie or episode slug to watch",
            },
            episode: {
              type: "string",
              description: "Episode identifier (optional, for series)",
            },
          },
          required: ["slug"],
        },
        execute: async ({ slug, episode }) => {
          const url = episode
            ? `/watch/${slug}?ep=${encodeURIComponent(String(episode))}`
            : `/watch/${slug}`
          window.location.href = url
          return { navigated: true, url }
        },
      },
      {
        name: "moviestream_go_to_search",
        description: "Navigate to the MovieStream search page with a pre-filled query.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query to pre-fill",
            },
          },
          required: ["query"],
        },
        execute: async ({ query }) => {
          const url = `/search?q=${encodeURIComponent(String(query))}`
          window.location.href = url
          return { navigated: true, url }
        },
      },
      {
        name: "moviestream_get_page_context",
        description:
          "Get information about the current MovieStream page — title, type, and available actions.",
        inputSchema: {
          type: "object",
          properties: {},
        },
        execute: async () => {
          return {
            url: window.location.href,
            pathname: window.location.pathname,
            title: document.title,
            site: "MovieStream",
            description:
              "MovieStream — Watch the latest movies and TV series online",
            capabilities: [
              "search",
              "browse",
              "watch",
              "watchlist",
              "comments",
            ],
          }
        },
      },
    ]

    // 1. Call provideContext if available (preferred by newer spec drafts and scanner validation)
    const mcAny = mc as any
    if (typeof mcAny.provideContext === "function") {
      try {
        mcAny.provideContext({ tools })
        console.log("WebMCP tools registered via provideContext")
      } catch (error) {
        console.error("WebMCP provideContext error:", error)
      }
    }

    // 2. Call registerTool for each tool as a fallback
    if (typeof mc.registerTool === "function") {
      for (const tool of tools) {
        try {
          mc.registerTool(tool)
        } catch (error) {
          console.error(`WebMCP registerTool error for ${tool.name}:`, error)
        }
      }
      console.log("WebMCP tools registered via registerTool")
    }

    // Cleanup: unregister tools when component unmounts
    return () => {
      if (mc.unregisterTool) {
        for (const tool of tools) {
          try {
            mc.unregisterTool(tool.name)
          } catch (e) {
            // Ignore
          }
        }
      }
    }
  }, [])

  // This component renders nothing — it only registers MCP tools
  return null
}

export default WebMCPProvider
