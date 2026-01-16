"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"

export default function HeaderWrapper() {
  const pathname = usePathname()
  const isSystem = pathname.startsWith("/system")

  if (isSystem) return null

  return <Navigation/>
}
