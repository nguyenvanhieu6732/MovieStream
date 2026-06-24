import { NextResponse } from "next/server"
import crypto from "crypto"
import fs from "fs"
import path from "path"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export async function GET() {
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
        description: "DNS for AI Discovery (DNS-AID) records for DNS-based agent discovery documentation and configuration instructions.",
        url: `${siteUrl}/DNS-AID.md`,
        digest: dnsAidDigest ? `sha256:${dnsAidDigest}` : "",
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
