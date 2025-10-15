// app/api/premium/plans/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const plans = await prisma.premiumPlan.findMany({ where: { isActive: true }, orderBy: { price: "asc" } });
    return NextResponse.json({ plans });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
