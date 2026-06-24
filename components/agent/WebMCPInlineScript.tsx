import Script from "next/script"

/**
 * WebMCP Inline Script
 * 
 * This injects a <script> tag that registers WebMCP tools immediately on page load,
 * before React hydration. This ensures headless browser scanners (like isitagentready.com)
 * can detect the tools even before the React app mounts.
 * 
 * The WebMCPProvider React component will then take over after hydration.
 */
export function WebMCPInlineScript() {
  const inlineCode = `
(function() {
  "use strict";

  // Tool definitions
  var tools = [
    {
      name: "moviestream_search",
      description: "Search the MovieStream catalog for movies and TV series. Returns titles, slugs, poster images, and metadata.",
      inputSchema: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Search keyword — movie title, actor, genre, etc." }
        },
        required: ["keyword"]
      },
      execute: function(args) {
        return fetch("/api/search?keyword=" + encodeURIComponent(String(args.keyword)))
          .then(function(res) { if (!res.ok) throw new Error("Search failed"); return res.json(); });
      }
    },
    {
      name: "moviestream_navigate_to_movie",
      description: "Navigate the browser to a specific movie's detail page on MovieStream.",
      inputSchema: {
        type: "object",
        properties: {
          slug: { type: "string", description: "The movie or series URL slug" }
        },
        required: ["slug"]
      },
      execute: function(args) {
        window.location.href = "/movie/" + args.slug;
        return Promise.resolve({ navigated: true, url: "/movie/" + args.slug });
      }
    },
    {
      name: "moviestream_watch",
      description: "Open the MovieStream video player for a specific movie or episode.",
      inputSchema: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Movie or episode slug to watch" },
          episode: { type: "string", description: "Episode identifier (optional, for series)" }
        },
        required: ["slug"]
      },
      execute: function(args) {
        var url = args.episode ? "/watch/" + args.slug + "?ep=" + encodeURIComponent(String(args.episode)) : "/watch/" + args.slug;
        window.location.href = url;
        return Promise.resolve({ navigated: true, url: url });
      }
    },
    {
      name: "moviestream_go_to_search",
      description: "Navigate to the MovieStream search page with a pre-filled query.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query to pre-fill" }
        },
        required: ["query"]
      },
      execute: function(args) {
        var url = "/search?q=" + encodeURIComponent(String(args.query));
        window.location.href = url;
        return Promise.resolve({ navigated: true, url: url });
      }
    },
    {
      name: "moviestream_get_page_context",
      description: "Get information about the current MovieStream page — title, type, and available actions.",
      inputSchema: {
        type: "object",
        properties: {}
      },
      execute: function() {
        return Promise.resolve({
          url: window.location.href,
          pathname: window.location.pathname,
          title: document.title,
          site: "MovieStream",
          description: "MovieStream — Watch the latest movies and TV series online",
          capabilities: ["search", "browse", "watch", "watchlist", "comments"]
        });
      }
    }
  ];

  // Get or create modelContext
  var mc = document.modelContext || (navigator && navigator.modelContext);
  if (!mc) {
    var registered = {};
    mc = {
      registerTool: function(tool, opts) {
        registered[tool.name] = tool;
        if (opts && opts.signal) {
          opts.signal.addEventListener("abort", function() { delete registered[tool.name]; });
        }
      },
      unregisterTool: function(name) { delete registered[name]; },
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return true; }
    };
    document.modelContext = mc;
    if (typeof navigator !== "undefined") navigator.modelContext = mc;
    window.__webmcp_tools__ = registered;
  }

  // Register all tools
  var controller = new AbortController();
  for (var i = 0; i < tools.length; i++) {
    try {
      mc.registerTool(tools[i], { signal: controller.signal });
    } catch(e) {
      console.error("[WebMCP] Failed to register " + tools[i].name, e);
    }
  }
  console.log("[WebMCP] " + tools.length + " tools registered on page load");

  // Store controller for cleanup
  window.__webmcp_abort__ = controller;
})();
`

  return (
    <Script
      id="webmcp-tools"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: inlineCode }}
    />
  )
}

export default WebMCPInlineScript
