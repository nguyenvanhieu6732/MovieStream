import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const host = request.headers.get("host") || new URL(request.url).host
  const protocol = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https") ? "https" : "http")
  const siteUrl = `${protocol}://${host}`

  const metadata = {
    // The resource identifier (this API)
    resource: `${siteUrl}/api`,

    // Authorization servers that can issue tokens for this resource
    authorization_servers: [siteUrl],

    // Bearer token methods accepted
    bearer_methods_supported: ["header"],

    // Scopes that can be requested for this resource
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "watchlist:read",
      "watchlist:write",
      "comments:read",
      "comments:write",
      "premium:read",
    ],

    // JWS algorithms supported for resource access tokens
    resource_signing_alg_values_supported: ["RS256"],

    // Resource documentation
    resource_documentation: `${siteUrl}/auth.md`,

    // Resource policy URI
    resource_policy_uri: `${siteUrl}/auth.md#policies`,
  }

  return NextResponse.json(metadata, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
