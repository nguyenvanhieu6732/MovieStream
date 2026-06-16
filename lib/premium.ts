// lib/premium.ts
import { prisma } from "@/lib/prisma";

export async function checkPremiumForUser(userId: string) {
  const now = new Date();

  const ownerSub = await prisma.subscription.findFirst({
    where: { ownerId: userId, status: "active", endDate: { gt: now } },
    include: { plan: true, members: true },
  });
  if (ownerSub) return { isPremium: true, subscription: ownerSub, role: "owner" };

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
  if (memberRel && memberRel.subscription) return { isPremium: true, subscription: memberRel.subscription, role: "member" };

  return { isPremium: false };
}
