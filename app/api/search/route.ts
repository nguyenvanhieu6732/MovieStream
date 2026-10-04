// app/api/search/route.ts
import { NextResponse } from "next/server"

import { getItems, searchUrl } from "@/lib/movieApi"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get("keyword")?.trim() || ""

  if (!keyword) return NextResponse.json({ data: [] })

  try {
    const res = await fetch(searchUrl(keyword), {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ data: [] }, { status: res.status })
    }

    const json = await res.json()
    return NextResponse.json({ data: getItems(json) })
  } catch (error) {
    console.error("[GET /api/search] error:", error)
    return NextResponse.json({ data: [] }, { status: 500 })
  }
}
