"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return <main key={pathname} className="page-transition relative z-10">{children}</main>
}
