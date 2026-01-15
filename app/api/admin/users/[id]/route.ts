import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { action } = await req.json()
  const userId = params.id

  try {
    if (action === "ban") {
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned: true },
      })
    }

    if (action === "unban") {
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned: false },
      })
    }

    if (action === "delete") {
      await prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true },
      })
    }

    if (action === "restore") {
      await prisma.user.update({
        where: { id: userId },
        data: { isDeleted: false },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
