"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useDeviceType } from "@/hooks/use-mobile";


export default function SplashProvider({ children }: { children: React.ReactNode }) {
  const [hideSplash, setHideSplash] = useState(false)
  const device = useDeviceType();
  useEffect(() => {
    // Scroll về đầu trang khi hiển thị splash
    window.scrollTo(0, 0)

    const timer = setTimeout(() => {
      setHideSplash(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative">
      {children}

      <AnimatePresence>
        {!hideSplash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black pointer-events-none"
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
              className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 px-4 text-center md:text-left"
            >
              {/* Logo */}
              <Image
                src="/logo.png"
                alt="MovieStream Logo"
                width={160}
                height={160}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
                priority
              />

              {/* Text content */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  MovieStream
                </h1>
                {device !== "mobile" && (
                  <>
                    <p className="text-xs sm:text-sm md:text-base text-gray-300 italic mt-1">
                      Phim hay trên MovieStream
                    </p>
                    <p className="mt-3 text-xs sm:text-sm md:text-base font-medium text-gray-400 max-w-[300px] leading-snug">
                      Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
                    </p>
                  </>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
