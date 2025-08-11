"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function SplashProvider({ children }: { children: React.ReactNode }) {
  const [hideSplash, setHideSplash] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHideSplash(true)
    }, 2000) // Giảm còn 2s

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative">
      {/* Nội dung chính luôn hiển thị ngay */}
      {children}

      <AnimatePresence>
        {!hideSplash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f0f1a] pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-row items-center gap-10"
            >
              <Image
                src="/logo.png"
                alt="MovieStream Logo"
                width={160}
                height={160}
              />
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white">MovieStream</h1>
                <p className="text-sm text-gray-300 italic mt-1">Phim hay trên MovieStream</p>
                <p className="mt-3 text-sm font-medium text-gray-400 max-w-[300px] leading-snug">
                  Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
