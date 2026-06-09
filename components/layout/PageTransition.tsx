"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.main
      key={pathname}
      className="relative z-10"
      initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.7 }}
    >
      {children}
    </motion.main>
  )
}
