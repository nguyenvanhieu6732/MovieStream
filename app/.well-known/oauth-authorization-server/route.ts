import { NextResponse } from "next/server"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/**
 * OAuth 2.0 Authorization Server Metadata
 * RFC 8414
 *
 * Provides authorization server metadata for AI agents and OAuth clients
 * integrating with MovieStream's NextAuth-backed auth system.
 */
export async function GET() {
  const metadata = {
    issuer: siteUrl,

    // Endpoints
    authorization_endpoint: `${siteUrl}/login`,
    token_endpoint: `${siteUrl}/api/auth/token`,
    jwks_uri: `${siteUrl}/.well-known/jwks.json`,
    registration_endpoint: `${siteUrl}/register`,
    revocation_endpoint: `${siteUrl}/api/auth/logout`,
    userinfo_endpoint: `${siteUrl}/api/auth/session`,
    end_session_endpoint: `${siteUrl}/api/auth/signout`,

    // Supported grant types
    grant_types_supported: [
      "authorization_code",
      "refresh_token",
    ],

    // Response types
    response_types_supported: ["code"],

    // Scopes
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

    // Token endpoint auth methods
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],

    // PKCE support
    code_challenge_methods_supported: ["S256"],

    // Revocation endpoint auth methods
    revocation_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],

    // Response modes
    response_modes_supported: ["query"],

    // Subject types
    subject_types_supported: ["public"],

    // ID token algorithms
    id_token_signing_alg_values_supported: ["RS256"],

    // Service documentation
    service_documentation: `${siteUrl}/auth.md`,

    // UI locales
    ui_locales_supported: ["en", "vi"],

    // Agent authentication configuration (auth.md protocol)
    agent_auth: {
      skill: `${siteUrl}/auth.md`,
      register_uri: `${siteUrl}/api/agent/register`,
      claim_uri: `${siteUrl}/api/agent/claim`,
      revocation_uri: `${siteUrl}/api/auth/logout`,
      identity_types_supported: ["anonymous", "identity_assertion"],
      anonymous: {
        credential_types_supported: ["api_key"],
      },
      identity_assertion: {
        assertion_types_supported: ["urn:ietf:params:oauth:token-type:id-jag", "verified_email"],
        credential_types_supported: ["bearer_token"],
      },
    },
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
