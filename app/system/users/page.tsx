import { prisma } from "@/lib/prisma"
import UsersTable from "./users-table"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isBanned: true,
    },
  })

  const safeUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(), // 👈 serialize
  }))


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UsersTable users={users} />
    </div>
  )
}
