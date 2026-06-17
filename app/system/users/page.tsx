import { ShieldAlert, UserCheck, UsersRound } from "lucide-react"
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
    orderBy: { createdAt: "desc" },
  })

  const safeUsers = users.map((user) => ({
    ...user,
    email: user.email ?? "",
    role: user.role as "user" | "admin",
    createdAt: user.createdAt.toISOString(),
  }))

  const activeUsers = safeUsers.filter(
    (user) => !user.isBanned && !user.isDeleted
  ).length
  const restrictedUsers = safeUsers.filter(
    (user) => user.isBanned || user.isDeleted
  ).length

  return (
    <div className="space-y-6">
      <section className="glass-panel relative isolate overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(244,63,94,0.18),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.10),transparent_30%)]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-white/62">
              <UsersRound className="h-3.5 w-3.5" />
              User directory
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Người dùng
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
              Theo dõi tài khoản, quyền admin và trạng thái kiểm duyệt trong
              một bảng dễ quét hơn.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[34rem]">
            <div className="rounded-[1.45rem] border border-white/12 bg-white/[0.055] p-4">
              <p className="text-sm text-white/44">Tổng</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {safeUsers.length.toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-white/12 bg-white/[0.055] p-4">
              <div className="flex items-center gap-2 text-sm text-white/44">
                <UserCheck className="h-4 w-4 text-emerald-300" />
                Active
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {activeUsers.toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-white/12 bg-white/[0.055] p-4">
              <div className="flex items-center gap-2 text-sm text-white/44">
                <ShieldAlert className="h-4 w-4 text-amber-300" />
                Cần chú ý
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {restrictedUsers.toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <UsersTable users={safeUsers} />
    </div>
  )
}
