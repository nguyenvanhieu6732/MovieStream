import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const userToken = cookieStore.get("user-token")

  if (!userToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In a real app, you'd fetch from database
  // For now, return mock data
  const watchlist = [1, 2, 3, 4, 5]

  return NextResponse.json({ watchlist })
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const userToken = cookieStore.get("user-token")

  if (!userToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { movieId } = await request.json()

  // In a real app, you'd save to database
  // For now, just return success
  return NextResponse.json({
    success: true,
    message: "Movie added to watchlist",
  })
}

export async function DELETE(request: NextRequest) {
  const cookieStore = cookies()
  const userToken = cookieStore.get("user-token")

  if (!userToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { movieId } = await request.json()

  // In a real app, you'd remove from database
  return NextResponse.json({
    success: true,
    message: "Movie removed from watchlist",
  })
}
