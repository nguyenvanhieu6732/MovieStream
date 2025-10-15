// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const plans = [
    { key: "personal_1m", name: "Cá nhân - 1 tháng", price: 49000, duration: "1 tháng", maxMembers: 1, description: "Gói cá nhân 1 tháng" },
    { key: "personal_3m", name: "Cá nhân - 3 tháng", price: 129000, duration: "3 tháng", maxMembers: 1, description: "Gói cá nhân 3 tháng" },
    { key: "personal_12m", name: "Cá nhân - 12 tháng", price: 490000, duration: "12 tháng", maxMembers: 1, description: "Gói cá nhân 12 tháng" },

    // { key: "family_1m", name: "Gia đình - 1 tháng", price: 129000, duration: "1 tháng", maxMembers: 3, description: "Gói gia đình 1 tháng (tối đa 3 tài khoản)" },
    // { key: "family_3m", name: "Gia đình - 3 tháng", price: 349000, duration: "3 tháng", maxMembers: 3, description: "Gói gia đình 3 tháng" },
    // { key: "family_12m", name: "Gia đình - 12 tháng", price: 1190000, duration: "12 tháng", maxMembers: 3, description: "Gói gia đình 12 tháng" },
  ];

  for (const p of plans) {
    await prisma.premiumPlan.upsert({
      where: { key: p.key },
      update: p,
      create: p,
    });
  }

  console.log("Seeded plans");
}

main()
  .catch(e => console.error(e))
  .finally(() => process.exit());
