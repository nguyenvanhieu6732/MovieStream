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
      isDeleted: true,
    },
  })

  const safeUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(), // 👈 serialize
  }))


  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="mb-2 text-sm text-white/46">Quản trị</p>
        <h1 className="text-3xl font-semibold tracking-tight">Người dùng</h1>
      </div>
      <UsersTable users={safeUsers} />
    </div>
  )
}
