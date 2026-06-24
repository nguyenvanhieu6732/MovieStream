# DNS-AID: Agent Identity and Discovery DNS Records

## Overview

DNS-AID (Agent Identity and Discovery via DNS) allows AI agents to discover this site's agent capabilities through DNS records. This document describes the required DNS records for MovieStream deployments.

---

## Required DNS Records

Replace `moviestream.app` with your actual domain name.

### 1. `_index._agents` — Agent Index Discovery

This record points AI agents to the well-known agent capabilities index.

```dns
; TXT record — Agent index pointer
_index._agents.moviestream.app.  IN  TXT  "v=aid1 url=https://moviestream.app/.well-known/agent-skills/index.json"

; HTTPS/SVCB record (preferred, RFC 9460)
_index._agents.moviestream.app.  3600  IN  HTTPS  1  moviestream.app.  alpn="h2,h3" port=443 mandatory=alpn,port
```

### 2. `_a2a._agents` — Agent-to-Agent Communication

This record describes the Agent-to-Agent (A2A) communication endpoint.

```dns
; TXT record — A2A endpoint
_a2a._agents.moviestream.app.  IN  TXT  "v=a2a1 mcp=https://moviestream.app/api/mcp transport=http"

; HTTPS/SVCB record
_a2a._agents.moviestream.app.  3600  IN  HTTPS  1  moviestream.app.  alpn="h2,h3" port=443 mandatory=alpn,port
```

### 3. `_mcp._agents` — MCP Server Discovery (Recommended)

```dns
; TXT record — MCP server card
_mcp._agents.moviestream.app.  IN  TXT  "v=mcp1 card=https://moviestream.app/.well-known/mcp/server-card.json"
```

### 4. `_oauth._agents` — OAuth Authorization Server

```dns
; TXT record — OAuth AS discovery
_oauth._agents.moviestream.app.  IN  TXT  "v=oauth2 as=https://moviestream.app/.well-known/oauth-authorization-server"
```

---

## HTTPS/SVCB Records (RFC 9460)

HTTPS records (`HTTPS` RR type 65) are the modern replacement for SRV records and enable HTTPS-only connections with parameter hints.

### Full Example Zone File

```dns
$ORIGIN moviestream.app.
$TTL 3600

; Standard records
@                  IN  A      <your-server-ip>
@                  IN  AAAA   <your-ipv6-address>
www                IN  CNAME  @

; Agent discovery records
_index._agents     3600 IN  TXT    "v=aid1 url=https://moviestream.app/.well-known/agent-skills/index.json"
_index._agents     3600 IN  HTTPS  1  moviestream.app.  alpn="h2,h3" port=443 mandatory=alpn,port

_a2a._agents       3600 IN  TXT    "v=a2a1 mcp=https://moviestream.app/api/mcp transport=http"
_a2a._agents       3600 IN  HTTPS  1  moviestream.app.  alpn="h2,h3" port=443 mandatory=alpn,port

_mcp._agents       3600 IN  TXT    "v=mcp1 card=https://moviestream.app/.well-known/mcp/server-card.json"
_oauth._agents     3600 IN  TXT    "v=oauth2 as=https://moviestream.app/.well-known/oauth-authorization-server"
```

---

## DNSSEC Recommendations

DNSSEC (DNS Security Extensions) is **strongly recommended** for agent identity records to prevent DNS spoofing attacks.

### Steps to Enable DNSSEC

1. **Check registrar support**: Ensure your domain registrar supports DNSSEC (Cloudflare, Route53, Google Domains all do).

2. **Enable at registrar**: Enable DNSSEC signing in your registrar's dashboard.

3. **For Cloudflare (recommended)**:
   ```
   1. Go to DNS → DNSSEC in Cloudflare dashboard
   2. Click "Enable DNSSEC"
   3. Add the DS record at your registrar
   ```

4. **For Vercel deployments**: Vercel uses Cloudflare for DNS — use the Vercel dashboard to point nameservers, then enable DNSSEC via Cloudflare.

5. **Verify DNSSEC**: Test with:
   ```bash
   dig +dnssec _index._agents.moviestream.app TXT
   dig +dnssec _a2a._agents.moviestream.app TXT
   ```

### DNSSEC Best Practices

- Use **ECDSA P-256 (algorithm 13)** for modern deployments
- Set TTL to **3600 seconds** (1 hour) for agent records
- Enable **automatic key rotation** where supported
- Monitor expiry of RRSIG records
- Use a **DS record with SHA-256** digest (digest type 2)

---

## Vercel Deployment DNS Configuration

For MovieStream deployed on Vercel:

1. **Add custom domain** in Vercel project settings
2. Vercel provides nameservers — point your registrar to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Add agent DNS records via the Vercel dashboard or Cloudflare (if using Cloudflare as nameserver)
4. Enable DNSSEC through Cloudflare dashboard

---

## Discovery Endpoint URLs

| Endpoint | URL |
|----------|-----|
| Agent Skills | `/.well-known/agent-skills/index.json` |
| MCP Server Card | `/.well-known/mcp/server-card.json` |
| API Catalog | `/.well-known/api-catalog` |
| OpenID Configuration | `/.well-known/openid-configuration` |
| OAuth AS Metadata | `/.well-known/oauth-authorization-server` |
| OAuth Protected Resource | `/.well-known/oauth-protected-resource` |
| OpenAPI Spec | `/.well-known/openapi.json` |
| MCP Endpoint | `/api/mcp` |
| Auth Documentation | `/auth.md` |

---

## Validation

Test DNS records after deployment:

```bash
# Verify agent index TXT record
dig _index._agents.moviestream.app TXT

# Verify A2A TXT record
dig _a2a._agents.moviestream.app TXT

# Test agent skills endpoint
curl -s https://moviestream.app/.well-known/agent-skills/index.json | jq .

# Test MCP server card
curl -s https://moviestream.app/.well-known/mcp/server-card.json | jq .

# Test API catalog
curl -s -H "Accept: application/linkset+json" https://moviestream.app/.well-known/api-catalog | jq .

# Test OpenID configuration
curl -s https://moviestream.app/.well-known/openid-configuration | jq .

# Test robots.txt with Content-Signal
curl -si https://moviestream.app/robots.txt | grep -i "Content-Signal"

# Test Link headers on homepage
curl -si https://moviestream.app/ | grep -i "link:"

# Test markdown content negotiation
curl -si -H "Accept: text/markdown" https://moviestream.app/auth.md
```
