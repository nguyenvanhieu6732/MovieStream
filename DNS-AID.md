# DNS-AID: DNS for AI Discovery Records

> **Specification**: [draft-mozleywilliams-dnsop-dnsaid-02](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
> **SVCB/HTTPS RR**: [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)

## Overview

DNS for AI Discovery (DNS-AID) standardizes publishing AI agents in DNS so that other agents can discover them. MovieStream publishes DNS-AID records under its domain so AI agent clients can locate the MCP server, A2A endpoint, and agent capabilities index through standard DNS queries.

DNS-AID uses **Service Binding (SVCB) records** ([RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)) for connectivity information and key metadata, and a **well-known entry point** at `_index._agents.<domain>` for organizational agent discovery.

---

## DNS Records

Replace `moviestream.app` with your actual domain name. All records use SVCB (RR type 64) or HTTPS (RR type 65) in ServiceMode.

### 1. `_index._agents` — Organizational Agent Index (Section 3.2)

The well-known entry point for agent discovery. An AI agent client that knows your domain but not which agent provides a required capability queries this record first.

```dns
; SVCB ServiceMode record — points to agent index endpoint
; alpn="h2" signals HTTP/2 transport
; key65400 carries the well-known URI path (experimental, pending IANA registration)
_index._agents.moviestream.app. 3600 IN SVCB 1 moviestream.app. (
    alpn="h2"
    port=443
    key65400="/.well-known/agent-skills/index.json"
    mandatory=alpn,port
)
```

### 2. `_mcp._agents` — MCP Agent Discovery (Section 3.1)

Known Agent pattern for the Model Context Protocol (MCP) server. A single SVCB query returns the target, transport, agent protocol, and capability metadata.

```dns
; SVCB ServiceMode record — MCP agent endpoint
; alpn="mcp,h2" signals MCP application protocol over HTTP/2 transport
; Per Section 3.1.1, each agent protocol is a separate record in the RRset
_mcp._agents.moviestream.app. 3600 IN SVCB 1 moviestream.app. (
    alpn="mcp,h2"
    port=443
    key65400="mcp/server-card.json"
    mandatory=alpn,port
)
```

### 3. `_a2a._agents` — Agent-to-Agent Discovery (Section 3.1)

Known Agent pattern for Agent-to-Agent (A2A) communication.

```dns
; SVCB ServiceMode record — A2A agent endpoint
; alpn="a2a,h2" signals A2A application protocol over HTTP/2 transport
_a2a._agents.moviestream.app. 3600 IN SVCB 1 moviestream.app. (
    alpn="a2a,h2"
    port=443
    mandatory=alpn,port
)
```

---

## Full Zone File Example

```dns
$ORIGIN moviestream.app.
$TTL 3600

; ─── Standard records ──────────────────────────────────────────────
@                  IN  A      <your-server-ip>
@                  IN  AAAA   <your-ipv6-address>
www                IN  CNAME  @

; ─── DNS-AID: Organizational Agent Index (Section 3.2) ─────────────
; Well-known entry point: _index._agents.<domain>
; Clients query this to discover all agents published by the organization
_index._agents     3600 IN SVCB 1 moviestream.app. (
    alpn="h2"
    port=443
    key65400="/.well-known/agent-skills/index.json"
    mandatory=alpn,port
)

; ─── DNS-AID: Known Agent — MCP (Section 3.1) ──────────────────────
; Model Context Protocol agent with well-known capability descriptor
_mcp._agents       3600 IN SVCB 1 moviestream.app. (
    alpn="mcp,h2"
    port=443
    key65400="mcp/server-card.json"
    mandatory=alpn,port
)

; ─── DNS-AID: Known Agent — A2A (Section 3.1.1) ────────────────────
; Agent-to-Agent protocol endpoint
_a2a._agents       3600 IN SVCB 1 moviestream.app. (
    alpn="a2a,h2"
    port=443
    mandatory=alpn,port
)
```

### Notes on SvcParamKeys

| SvcParamKey | Status | Description |
|-------------|--------|-------------|
| `alpn` | Registered ([RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)) | Application-layer protocol negotiation identifiers |
| `port` | Registered ([RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)) | TCP port number |
| `mandatory` | Registered ([RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)) | Keys that MUST be understood by the client |
| `key65400` | Experimental (private-use range) | `well-known` — URI path for capability descriptor. Uses numeric `keyNNNNN` form per [RFC 9460 §2.1](https://www.rfc-editor.org/rfc/rfc9460#section-2.1) until IANA registration is granted |
| `key65401` | Experimental (private-use range) | `cap` — capability descriptor locator |
| `key65402` | Experimental (private-use range) | `cap-sha256` — SHA-256 digest of capability descriptor |
| `key65403` | Experimental (private-use range) | `bap` — bulk agent protocol version |

Once the SvcParamKeys in [draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) are assigned by IANA, replace the `keyNNNNN` names with their registered names (e.g. `well-known`, `cap`, `cap-sha256`).

---

## DNSSEC Configuration

DNSSEC is **strongly recommended** (SHOULD per the spec; MUST if TLSA records are used) to provide data origin authentication and integrity for DNS-AID records.

### Enable DNSSEC

1. **Cloudflare** (recommended):
   ```
   Dashboard → DNS → DNSSEC → Enable DNSSEC
   Copy the DS record and add it at your domain registrar
   ```

2. **Vercel DNS**:
   Vercel uses Cloudflare under the hood. Contact Vercel support or use Cloudflare as your primary nameserver to enable DNSSEC.

3. **AWS Route 53**:
   ```
   Route 53 → Hosted Zones → your domain → DNSSEC signing → Enable
   Add the DS record at your registrar
   ```

### Verify DNSSEC

```bash
# Check DNSSEC validation for agent index
dig +dnssec _index._agents.moviestream.app SVCB

# Check DNSSEC validation for MCP agent
dig +dnssec _mcp._agents.moviestream.app SVCB

# Check DNSSEC validation for A2A agent
dig +dnssec _a2a._agents.moviestream.app SVCB
```

### DNSSEC Best Practices

- Use **ECDSA P-256 (algorithm 13)** for modern deployments
- Set TTL to **3600 seconds** (1 hour) for agent records
- Enable **automatic key rotation** where supported
- Monitor expiry of RRSIG records
- Use a **DS record with SHA-256** digest (digest type 2)

---

## DNS Provider Compatibility

Not all DNS providers support SVCB (type 64) natively yet. Here are workarounds:

| Provider | SVCB Support | Workaround |
|----------|-------------|------------|
| Cloudflare | ✅ Native | Use dashboard or API |
| AWS Route 53 | ✅ Native | Use console or CLI |
| Google Cloud DNS | ✅ Native | Use console or `gcloud` CLI |
| Vercel DNS | ⚠️ Via Cloudflare | Use Cloudflare API with Vercel nameservers |
| GoDaddy | ❌ Not yet | Use Cloudflare as nameserver |
| Namecheap | ❌ Not yet | Use Cloudflare as nameserver |

### Cloudflare API Example

```bash
# Add _index._agents SVCB record via Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/dns_records" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "SVCB",
    "name": "_index._agents",
    "data": {
      "priority": 1,
      "target": "moviestream.app.",
      "value": "alpn=\"h2\" port=443 key65400=\"/.well-known/agent-skills/index.json\" mandatory=alpn,port"
    },
    "ttl": 3600
  }'
```

---

## Discovery Endpoint URLs

These are the HTTP endpoints that DNS-AID records point to:

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Agent Skills Index | `/.well-known/agent-skills/index.json` | Organizational agent inventory |
| MCP Server Card | `/.well-known/mcp/server-card.json` | MCP capability descriptor |
| API Catalog | `/.well-known/api-catalog` | RFC 9264 API catalog |
| OpenAPI Spec | `/.well-known/openapi.json` | OpenAPI specification |
| OAuth AS Metadata | `/.well-known/oauth-authorization-server` | OAuth authorization server |
| OAuth Protected Resource | `/.well-known/oauth-protected-resource` | OAuth resource metadata |
| MCP Endpoint | `/api/mcp` | MCP transport endpoint |

---

## Validation

### Test DNS Records

```bash
# Query SVCB records via DNS-over-HTTPS (Cloudflare)
curl -s "https://cloudflare-dns.com/dns-query?name=_index._agents.moviestream.app&type=SVCB" \
  -H "Accept: application/dns-json" | jq .

curl -s "https://cloudflare-dns.com/dns-query?name=_mcp._agents.moviestream.app&type=SVCB" \
  -H "Accept: application/dns-json" | jq .

curl -s "https://cloudflare-dns.com/dns-query?name=_a2a._agents.moviestream.app&type=SVCB" \
  -H "Accept: application/dns-json" | jq .
```

### Test HTTP Endpoints

```bash
# Test agent skills index
curl -s https://moviestream.app/.well-known/agent-skills/index.json | jq .

# Test MCP server card
curl -s https://moviestream.app/.well-known/mcp/server-card.json | jq .

# Test API catalog
curl -s -H "Accept: application/linkset+json" https://moviestream.app/.well-known/api-catalog | jq .
```

### Run Scanner

```bash
# Validate with isitagentready.com
curl -s -X POST https://isitagentready.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://moviestream.app"}' | jq '.checks.discoverability.dnsAid'
```

Check that `checks.discoverability.dnsAid.status` is `"pass"`.

---

## References

- [draft-mozleywilliams-dnsop-dnsaid-02](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) — DNS for AI Discovery
- [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) — Service Binding and Parameter Specification via DNS (SVCB and HTTPS)
- [RFC 6698](https://www.rfc-editor.org/rfc/rfc6698) — DANE TLSA
- [RFC 9364](https://www.rfc-editor.org/rfc/rfc9364) — DNSSEC
- [RFC 8615](https://www.rfc-editor.org/rfc/rfc8615) — Well-Known URIs
- [RFC 6763](https://www.rfc-editor.org/rfc/rfc6763) — DNS-Based Service Discovery
