import { NextResponse } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * OAuth 2.0 Protected Resource Metadata
 * RFC 9728
 *
 * Describes which authorization servers protect MovieStream's API resources,
 * and which scopes are required to access them.
 */
export async function GET() {
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
