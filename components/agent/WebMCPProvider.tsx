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

    // Tool: Search movies
    mc.registerTool({
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
    })

    // Tool: Navigate to movie detail
    mc.registerTool({
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
    })

    // Tool: Navigate to watch page
    mc.registerTool({
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
    })

    // Tool: Search with navigation
    mc.registerTool({
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
    })

    // Tool: Get page context
    mc.registerTool({
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
    })

    // Cleanup: unregister tools when component unmounts
    return () => {
      if (mc.unregisterTool) {
        mc.unregisterTool("moviestream_search")
        mc.unregisterTool("moviestream_navigate_to_movie")
        mc.unregisterTool("moviestream_watch")
        mc.unregisterTool("moviestream_go_to_search")
        mc.unregisterTool("moviestream_get_page_context")
      }
    }
  }, [])

  // This component renders nothing — it only registers MCP tools
  return null
}

export default WebMCPProvider
