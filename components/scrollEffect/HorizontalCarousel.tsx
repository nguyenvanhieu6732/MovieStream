// components/carousel/HorizontalCarousel.tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  items: React.ReactNode[];   // 👈 mảng các item render (card, ảnh,...)
  itemWidth?: string;         // 👈 width từng item, ví dụ "380px"
  gap?: number;               // 👈 khoảng cách giữa các item (px)
}

export default function HorizontalCarousel({ 
  items, 
  itemWidth = "380px", 
  gap = 24,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (emblaApi) setIsReady(true);
  }, [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden">
      {isReady && (
        <>
          {/* Chevron trái */}
          <div className="absolute left-0 top-0 bottom-0 w-12 z-20 
                          bg-gradient-to-r from-background to-transparent flex items-center">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="bg-white text-black p-2 rounded-full shadow-lg"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          </div>

          {/* Chevron phải */}
          <div className="absolute right-0 top-0 bottom-0 w-12 z-20 
                          bg-gradient-to-l from-background to-transparent flex items-center justify-end">
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="bg-white text-black p-2 rounded-full shadow-lg"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}

      {/* Track */}
      <div className="overflow-hidden px-8" ref={emblaRef}>
        <div className="flex" style={{ gap: `${gap}px` }}>
          {items.map((item, idx) => (
            <div key={idx} className="flex-shrink-0" style={{ width: itemWidth }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
