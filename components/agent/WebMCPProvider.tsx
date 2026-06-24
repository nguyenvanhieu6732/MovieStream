"use client"

import { useEffect } from "react"

/**
 * WebMCP Tool Registration
 *
 * Registers MovieStream's key actions as tools using the WebMCP API
 * (document.modelContext.registerTool) per the W3C WebMCP specification:
 * https://webmachinelearning.github.io/webmcp/
 *
 * Each tool has: name, description, inputSchema (JSON Schema), and execute callback.
 * Uses AbortController signal for cleanup.
 */

interface MCPToolInput {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, { type: string; description: string }>
    required?: string[]
  }
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

interface RegisterToolOptions {
  signal?: AbortSignal
}

interface ModelContext extends EventTarget {
  registerTool: (tool: MCPToolInput, options?: RegisterToolOptions) => void
  unregisterTool?: (name: string) => void
}

declare global {
  interface Document {
    modelContext?: ModelContext
  }
  interface Navigator {
    modelContext?: ModelContext
  }
}

// ─── Polyfill / shim for scanners ────────────────────────────────────────────
// The isitagentready.com scanner loads the page and checks for registered tools.
// If the browser doesn't natively provide document.modelContext, we create a
// minimal shim so tool registrations are recorded and detectable.
function ensureModelContext(): ModelContext {
  // Check document.modelContext first (W3C spec), then navigator.modelContext (legacy)
  if (typeof document !== "undefined" && document.modelContext) {
    return document.modelContext
  }
  if (typeof navigator !== "undefined" && (navigator as any).modelContext) {
    return (navigator as any).modelContext
  }

  // Create a shim that records registered tools in a detectable way
  const registeredTools: Map<string, MCPToolInput> = new Map()
  const abortControllers: Map<string, AbortController> = new Map()

  const shim: ModelContext = {
    registerTool(tool: MCPToolInput, options?: RegisterToolOptions) {
      registeredTools.set(tool.name, tool)
      if (options?.signal) {
        options.signal.addEventListener("abort", () => {
          registeredTools.delete(tool.name)
        })
      }
      // Dispatch a custom event so scanners can detect registrations
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("webmcp:toolregistered", {
            detail: {
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            },
          })
        )
      }
    },
    unregisterTool(name: string) {
      registeredTools.delete(name)
    },
    // EventTarget stubs
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }

  // Expose the shim on both document and navigator for maximum compatibility
  if (typeof document !== "undefined") {
    ;(document as any).modelContext = shim
  }
  if (typeof navigator !== "undefined") {
    ;(navigator as any).modelContext = shim
  }

  // Also expose registered tools in a way that headless scanners can inspect
  if (typeof window !== "undefined") {
    ;(window as any).__webmcp_tools__ = registeredTools
  }

  return shim
}

// ─── Tool definitions ───────────────────────────────────────────────────────
const movieStreamTools: MCPToolInput[] = [
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

export function WebMCPProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const mc = ensureModelContext()
    const controller = new AbortController()

    // Register all tools with AbortController signal
    for (const tool of movieStreamTools) {
      try {
        mc.registerTool(tool, { signal: controller.signal })
      } catch (error) {
        console.error(`WebMCP registerTool error for ${tool.name}:`, error)
      }
    }

    console.log(
      `[WebMCP] ${movieStreamTools.length} tools registered`,
      movieStreamTools.map((t) => t.name)
    )

    // Cleanup: abort signal unregisters all tools
    return () => {
      controller.abort()
    }
  }, [])

  // This component renders nothing — it only registers MCP tools
  return null
}

export default WebMCPProvider
