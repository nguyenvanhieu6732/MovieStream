// app/api/premium/plans/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await prisma.premiumPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ plans });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
