import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const host = request.headers.get("host") || new URL(request.url).host
  const protocol = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https") ? "https" : "http")
  const siteUrl = `${protocol}://${host}`

  const config = {
    issuer: siteUrl,
    authorization_endpoint: `${siteUrl}/api/auth/signin`,
    token_endpoint: `${siteUrl}/api/auth/token`,
    userinfo_endpoint: `${siteUrl}/api/auth/session`,
    jwks_uri: `${siteUrl}/.well-known/jwks.json`,
    registration_endpoint: `${siteUrl}/api/auth/register`,
    end_session_endpoint: `${siteUrl}/api/auth/signout`,
    
    // Supported grant types
    grant_types_supported: [
      "authorization_code",
      "refresh_token",
    ],
    
    // Supported response types
    response_types_supported: [
      "code",
    ],
    
    // Subject types
    subject_types_supported: ["public"],
    
    // ID token signing algorithms
    id_token_signing_alg_values_supported: ["RS256"],
    
    // Scopes supported
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "watchlist:read",
      "watchlist:write",
      "comments:read",
      "comments:write",
    ],
    
    // Claims supported
    claims_supported: [
      "sub",
      "name",
      "email",
      "picture",
      "role",
      "premium",
    ],
    
    // Token endpoint auth methods
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],
    
    // Code challenge methods (PKCE)
    code_challenge_methods_supported: ["S256"],

    // Service documentation
    service_documentation: `${siteUrl}/auth.md`,
  }

  return NextResponse.json(config, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
