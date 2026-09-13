"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollProps {
    children: React.ReactNode;
}

export function HorizontalScroll({ children }: HorizontalScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, []);

    const scroll = (dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.7;
        el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    return (
        <div className="relative group">
            {/* Left arrow */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface border border-border shadow-md flex items-center justify-center text-fg hover:bg-bg transition-colors opacity-0 group-hover:opacity-100 -translate-x-1/2"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={16} />
                </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface border border-border shadow-md flex items-center justify-center text-fg hover:bg-bg transition-colors opacity-0 group-hover:opacity-100 translate-x-1/2"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={16} />
                </button>
            )}

            {/* Left fade */}
            {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg to-transparent z-[1] pointer-events-none" />
            )}

            {/* Right fade */}
            {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg to-transparent z-[1] pointer-events-none" />
            )}

            {/* Scrollable content */}
            <div
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {children}
            </div>
        </div>
    );
}
