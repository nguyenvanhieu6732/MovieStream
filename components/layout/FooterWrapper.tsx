"use client"

import { usePathname } from "next/navigation"
import Footer from "./footer"

export default function HeaderWrapper() {
  const pathname = usePathname()
  const isSystem = pathname.startsWith("/system")

  if (isSystem) return null

  return <Footer/>
}
