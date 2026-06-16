// app/api/search/route.ts
import { NextResponse } from "next/server"
import { load } from "cheerio"

let cachedBuildId: { value: string; expiresAt: number } | null = null

async function getBuildId() {
  const now = Date.now()
  if (cachedBuildId && cachedBuildId.expiresAt > now) {
    return cachedBuildId.value
  }

  const homepageRes = await fetch("https://ophim17.cc", { next: { revalidate: 3600 } })
  const homepageHtml = await homepageRes.text()
  const $ = load(homepageHtml)

  const buildId = $("script[src*='/_next/static/']")
    .attr("src")
    ?.match(/\/_next\/static\/([^/]+)\//)?.[1]

  if (buildId) {
    cachedBuildId = { value: buildId, expiresAt: now + 60 * 60 * 1000 }
  }

  return buildId
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get("keyword") || ""

  if (!keyword) return NextResponse.json({ data: [] })

  const buildId = await getBuildId()

  if (!buildId) return NextResponse.json({ error: "Build ID not found" }, { status: 500 })

  const searchUrl = `https://ophim17.cc/_next/data/${buildId}/tim-kiem.json?keyword=${encodeURIComponent(keyword)}`
  const res = await fetch(searchUrl, { next: { revalidate: 300 } })
  const json = await res.json()

  const data = json?.pageProps?.data || []

  return NextResponse.json({ data })
}
