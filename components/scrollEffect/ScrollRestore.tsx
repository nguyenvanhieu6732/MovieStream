// components/ScrollRestore.tsx
"use client";
import { useEffect } from "react";

export default function ScrollRestore({ storageKey, children }: { storageKey: string; children: React.ReactNode }) {
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(storageKey);
    if (savedScroll) {
      window.scrollTo({
        top: parseInt(savedScroll, 10),
        behavior: "smooth"
      });
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return <>{children}</>;
}
