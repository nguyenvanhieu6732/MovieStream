import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import crypto from "crypto"

export async function GET(request: Request) {
  try {
    const filePath = path.join(process.cwd(), "DNS-AID.md")
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const tokens = Math.ceil(fileContent.length / 4)
    const etag = `"${crypto.createHash("sha256").update(fileContent).digest("hex").slice(0, 16)}"`

    // Support conditional requests
    const ifNoneMatch = request.headers.get("if-none-match")
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: etag },
      })
    }

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
        "Content-Signal": "ai-train=no, search=yes, ai-input=no",
        ETag: etag,
        "x-markdown-tokens": tokens.toString(),
        "x-dns-aid-spec": "draft-mozleywilliams-dnsop-dnsaid-02",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
