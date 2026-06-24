import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import crypto from "crypto"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "DNS-AID.md")
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const tokens = Math.ceil(fileContent.length / 4)

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "x-markdown-tokens": tokens.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
