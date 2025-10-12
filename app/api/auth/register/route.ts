import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu bắt buộc" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.hashedPassword) {
        return NextResponse.json(
          {
            message:
              "Email đã tồn tại.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: "Email đã tồn tại." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword: hashed,
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    console.error("[/api/register] error:", error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
