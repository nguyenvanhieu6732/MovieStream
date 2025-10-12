// app/api/profile/route.ts
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, avatar } = await req.json();
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name?.trim(),
        image: avatar || null,
      },
      select: { name: true, image: true },
    });

    return Response.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}