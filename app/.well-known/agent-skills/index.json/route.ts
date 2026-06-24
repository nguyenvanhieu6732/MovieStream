import { NextResponse } from "next/server"
import crypto from "crypto"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
  const host = request.headers.get("host") || new URL(request.url).host
  const protocol = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https") ? "https" : "http")
  const siteUrl = `${protocol}://${host}`

  let dnsAidDigest = ""
  try {
    const filePath = path.join(process.cwd(), "DNS-AID.md")
    const fileContent = fs.readFileSync(filePath, "utf-8")
    dnsAidDigest = crypto.createHash("sha256").update(fileContent).digest("hex")
  } catch (error) {
    console.error("Failed to read DNS-AID.md for digest calculation", error)
  }

  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "dns-aid",
        type: "skill-md",
        description:
          "DNS for AI Discovery (DNS-AID) records for DNS-based agent discovery. " +
          "Publishes SVCB/HTTPS ServiceMode records under the _agents namespace with alpn " +
          "and endpoint parameters per draft-mozleywilliams-dnsop-dnsaid-02 and RFC 9460.",
        url: `${siteUrl}/DNS-AID.md`,
        digest: dnsAidDigest ? `sha256:${dnsAidDigest}` : "",
        spec: "https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/",
        dnsRecords: {
          _index: `_index._agents.${host}`,
          _mcp: `_mcp._agents.${host}`,
          _a2a: `_a2a._agents.${host}`,
        },
      },
    ],
  }

  return NextResponse.json(index, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
