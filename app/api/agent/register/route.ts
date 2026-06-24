import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Dummy response, as passive scanners do not probe registration
    return NextResponse.json({
      status: "success",
      client_id: "agent_client_" + Math.random().toString(36).substring(7),
      message: "Agent registration placeholder endpoint",
      registered_at: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "MovieStream Agent Registration endpoint. POST to register." },
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
