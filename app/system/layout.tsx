import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import SystemLayoutClient from "@/components/system/SystemLayoutClient"
export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="dark">
      <SystemLayoutClient>{children}</SystemLayoutClient>
    </div>
  )
}
