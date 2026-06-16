// app/api/search/route.ts
import { NextResponse } from "next/server"

const OPHIM_API = process.env.NEXT_PUBLIC_OPHIM_API || "https://ophim1.com/v1/api"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get("keyword")?.trim() || ""

  if (!keyword) return NextResponse.json({ data: [] })

  try {
    const res = await fetch(`${OPHIM_API}/tim-kiem?keyword=${encodeURIComponent(keyword)}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ data: [] }, { status: res.status })
    }

    const json = await res.json()
    return NextResponse.json({ data: json.data?.items || [] })
  } catch (error) {
    console.error("[GET /api/search] error:", error)
    return NextResponse.json({ data: [] }, { status: 500 })
  }
}
