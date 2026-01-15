import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { isPremium: false, message: "Missing slug" },
        { status: 400 }
      );
    }

    const premiumMovie = await prisma.premiumMovie.findUnique({
      where: { slug },
      select: { id: true },
    });

    return NextResponse.json({
      isPremium: Boolean(premiumMovie),
    });
  } catch (error) {
    console.error("Check premium error:", error);
    return NextResponse.json(
      { isPremium: false },
      { status: 500 }
    );
  }
}
