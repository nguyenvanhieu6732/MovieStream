// app/api/search/route.ts
import { NextResponse } from "next/server"
import { load } from "cheerio"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get("keyword") || ""

  if (!keyword) return NextResponse.json({ data: [] })

  // 1. Lấy BUILD_ID từ trang chủ
  const homepageRes = await fetch("https://ophim17.cc")
  const homepageHtml = await homepageRes.text()
  const $ = load(homepageHtml)

  const buildId = $("script[src*='/_next/static/']")
    .attr("src")
    ?.match(/\/_next\/static\/([^/]+)\//)?.[1]

  if (!buildId) return NextResponse.json({ error: "Không tìm thấy BUILD_ID" }, { status: 500 })

  // 2. Gọi đến tim-kiem.json
  const searchUrl = `https://ophim17.cc/_next/data/${buildId}/tim-kiem.json?keyword=${encodeURIComponent(keyword)}`
  const res = await fetch(searchUrl)
  const json = await res.json()

  const data = json?.pageProps?.data || []

  return NextResponse.json({ data })
}
