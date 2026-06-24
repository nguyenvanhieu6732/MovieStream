import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json({
      status: "success",
      message: "Agent binding placeholder endpoint",
      bound_at: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "MovieStream Agent Claim endpoint. POST to claim/bind." },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
