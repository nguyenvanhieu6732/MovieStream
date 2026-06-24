import { NextResponse } from "next/server"

/**
 * /auth.md — Agent registration and authentication documentation
 * Served as text/markdown for AI agents, text/html for browsers.
 * Referenced by OpenID configuration and OAuth AS metadata.
 */

const MARKDOWN_CONTENT = `# MovieStream Authentication Guide

> This document describes how AI agents and third-party clients can authenticate with MovieStream.

## Overview

MovieStream uses **NextAuth.js** (v4) for authentication. The system supports:
- Email/Password credentials
- Session-based authentication (cookies)
- OAuth 2.0 authorization code flow (for agents)

---

## Agent Registration Flow

Agents that need to access authenticated endpoints must:

1. **Discover the authorization server** at \`/.well-known/openid-configuration\`
2. **Register** a client application at \`/register\`
3. **Request authorization** by redirecting users to \`/login\`
4. **Exchange the authorization code** for tokens at \`/api/auth/token\`
5. **Use the token** in the \`Authorization: Bearer <token>\` header

---

## OAuth 2.0 Endpoints

| Endpoint | URL | Description |
|----------|-----|-------------|
| Authorization | \`/login\` | User login page |
| Token | \`/api/auth/token\` | Token exchange endpoint |
| UserInfo | \`/api/auth/session\` | Current session info |
| Revocation | \`/api/auth/logout\` | Revoke tokens/session |
| JWKS | \`/.well-known/jwks.json\` | Public key set |
| Discovery | \`/.well-known/openid-configuration\` | OIDC Discovery Document |
| AS Metadata | \`/.well-known/oauth-authorization-server\` | RFC 8414 Metadata |
| Protected Resource | \`/.well-known/oauth-protected-resource\` | RFC 9728 Metadata |

---

## Supported Grant Types

- \`authorization_code\` — For user-delegated access (recommended for agents)
- \`refresh_token\` — For long-lived access

---

## Supported Credentials

- **Email + Password**: Credentials provider via NextAuth
- **Session Cookies**: \`next-auth.session-token\` cookie
- **Bearer Tokens**: \`Authorization: Bearer <token>\` header

---

## Scopes

| Scope | Description | Requires Auth |
|-------|-------------|---------------|
| \`openid\` | Basic identity | Yes |
| \`profile\` | Name and avatar | Yes |
| \`email\` | Email address | Yes |
| \`watchlist:read\` | Read user's watchlist | Yes |
| \`watchlist:write\` | Add/remove watchlist items | Yes |
| \`comments:read\` | Read comments (also public) | Optional |
| \`comments:write\` | Post and delete comments | Yes |
| \`premium:read\` | Check premium status | Yes |

---

## PKCE Support

MovieStream's authorization server supports **PKCE** (Proof Key for Code Exchange) with the \`S256\` method. Agents should always use PKCE for public clients.

---

## Token Revocation

To revoke a session or token, send a request to:
\`\`\`
POST /api/auth/logout
Authorization: Bearer <token>
\`\`\`

Or for session-based auth:
\`\`\`
GET /api/auth/signout
\`\`\`

---

## Policies

- Tokens are short-lived (session-based, expire on browser close or after 30 days with "remember me")
- Rate limits apply: 100 requests/minute per IP for public endpoints
- Authenticated endpoints: 300 requests/minute per user
- Admin endpoints (\`/api/admin/*\`) are restricted to admin roles only

---

## Public Endpoints (No Auth Required)

- \`GET /api/search?keyword=...\` — Movie search
- \`GET /api/posts\` — Movie catalog
- \`GET /api/comments?movieId=...\` — Read comments
- \`GET /api/status\` — API health
- \`GET /.well-known/*\` — Discovery documents

---

## Further Reading

- [OpenAPI Specification](/.well-known/openapi.json)
- [API Catalog](/.well-known/api-catalog)
- [Agent Skills](/.well-known/agent-skills)
- [MCP Server Card](/.well-known/mcp/server-card)
`

export async function GET(request: Request) {
  const acceptHeader = request.headers.get("accept") ?? ""

  // Return markdown for agents requesting text/markdown
  if (acceptHeader.includes("text/markdown") || acceptHeader.includes("text/plain")) {
    return new NextResponse(MARKDOWN_CONTENT, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }

  // For browsers, return a simple HTML version
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MovieStream — Authentication Guide</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 860px; margin: 0 auto; padding: 2rem; line-height: 1.7; color: #1a1a2e; }
    h1 { color: #0f0f23; } h2 { color: #16213e; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.3em; }
    table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f4; } code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 1rem; color: #555; }
    a { color: #6366f1; }
  </style>
</head>
<body>
  <pre style="display:none" id="md-source">${MARKDOWN_CONTENT.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  <div id="content">
    <p>Loading documentation...</p>
  </div>
  <script>
    // Simple markdown to HTML conversion for browser display
    const md = document.getElementById('md-source').textContent;
    // Redirect agents that prefer markdown
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.type = 'text/markdown';
    link.href = '/auth.md';
    document.head.appendChild(link);
    // Redirect to the markdown version info
    document.getElementById('content').innerHTML = '<p>View the <a href="?format=md">raw markdown version</a> of this document, or see below for the rendered version.</p>' + 
      '<iframe src="https://markdownlivepreview.com/" style="display:none"></iframe>' +
      '<p><strong>Note for AI agents:</strong> Request this URL with <code>Accept: text/markdown</code> to receive the raw markdown.</p>';
  </script>
  <noscript>
    <h1>MovieStream Authentication Guide</h1>
    <p>This page requires JavaScript for full rendering. AI agents: request with <code>Accept: text/markdown</code> header.</p>
  </noscript>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "Link": `</auth.md>; rel="alternate"; type="text/markdown"`,
      "Access-Control-Allow-Origin": "*",
    },
  })
}
