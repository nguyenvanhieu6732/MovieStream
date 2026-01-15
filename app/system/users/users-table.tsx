"use client"

import { useState } from "react"
import { toast } from "sonner"

type User = {
  id: string
  name: string | null
  email: string
  role: "user" | "admin"
  createdAt: string
  isBanned: boolean
  isDeleted: boolean
}

export default function UsersTable({ users }: { users: User[] }) {
  const [list, setList] = useState<User[]>(users)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  function confirmToast(message: string, onConfirm: () => void) {
    toast(message, {
      duration: 10000,
      action: {
        label: "Xác nhận",
        onClick: onConfirm,
      },
      cancel: {
        label: "Hủy",
      },
    })
  }

  function confirmAction(
    user: User,
    action: "ban" | "unban" | "delete" | "restore"
  ) {
    const text =
      action === "ban"
        ? `Bạn có muốn BAN người dùng ${user.email}?`
        : action === "unban"
        ? `Gỡ BAN người dùng ${user.email}?`
        : action === "delete"
        ? `Bạn có muốn XÓA người dùng ${user.email}?`
        : `Khôi phục người dùng ${user.email}?`

    confirmToast(text, () => doAction(user.id, action))
  }

  async function doAction(
    userId: string,
    action: "ban" | "unban" | "delete" | "restore"
  ) {
    setLoadingId(userId)

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })

    if (!res.ok) {
      toast.error("Thao tác thất bại")
      setLoadingId(null)
      return
    }

    setList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              isDeleted:
                action === "delete"
                  ? true
                  : action === "restore"
                  ? false
                  : u.isDeleted,
              isBanned:
                action === "ban"
                  ? true
                  : action === "unban"
                  ? false
                  : u.isBanned,
            }
          : u
      )
    )

    toast.success("Thao tác thành công")
    setLoadingId(null)
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-3 text-left">Họ Tên</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Vai Trò</th>
            <th className="p-3 text-left">Ngày Tạo</th>
            <th className="p-3 text-left">Hành Động</th>
          </tr>
        </thead>

        <tbody>
          {list.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-3">{user.name ?? "—"}</td>

              <td
                className={`p-3 ${
                  user.isDeleted ? "line-through text-gray-400" : ""
                }`}
              >
                {user.email != null ? user.email : "Facebook User"}
              </td>

              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {user.role}
                </span>
              </td>

              <td className="p-3">
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </td>

              <td className="p-3">
                {user.role === "admin" ? (
                  <span className="text-gray-400 italic">admin</span>
                ) : user.isDeleted ? (
                  <button
                    disabled={loadingId === user.id}
                    onClick={() => confirmAction(user, "restore")}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-600"
                  >
                    Khôi Phục
                  </button>
                ) : (
                  <div className="flex gap-2">
                    {user.isBanned ? (
                      <button
                        disabled={loadingId === user.id}
                        onClick={() => confirmAction(user, "unban")}
                        className="px-3 py-1 rounded bg-green-100 text-green-600"
                      >
                        Gỡ Cấm
                      </button>
                    ) : (
                      <button
                        disabled={loadingId === user.id}
                        onClick={() => confirmAction(user, "ban")}
                        className="px-3 py-1 rounded bg-yellow-100 text-yellow-600"
                      >
                        Cấm
                      </button>
                    )}

                    <button
                      disabled={loadingId === user.id}
                      onClick={() => confirmAction(user, "delete")}
                      className="px-3 py-1 rounded bg-red-100 text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
