// app/api/premium/status/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path to your next-auth config

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ isPremium: false });

    const userId = session.user.id as string;
    const now = new Date();

    const ownerSub = await prisma.subscription.findFirst({
      where: { ownerId: userId, status: "active", endDate: { gt: now } },
      include: { plan: true, members: true },
    });
    if (ownerSub) return NextResponse.json({ isPremium: true, subscription: ownerSub, role: "owner" });

    const memberRel = await prisma.subscriptionMember.findFirst({
      where: {
        userId,
        subscription: {
          status: "active",
          endDate: { gt: now }
        }
      },
      include: { subscription: { include: { plan: true } } },
    });
    if (memberRel && memberRel.subscription) return NextResponse.json({ isPremium: true, subscription: memberRel.subscription, role: "member" });

    return NextResponse.json({ isPremium: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ isPremium: false }, { status: 500 });
  }
}
