"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface FeaturedNovel {
    id: string;
    title: string;
    description: string;
    coverUrl?: string | null;
    averageRating?: number | null;
    totalRatings?: number;
    author: {
        name: string | null;
    };
}

interface HeroCarouselProps {
    novels: FeaturedNovel[];
}

export function HeroCarousel({ novels }: HeroCarouselProps) {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % novels.length);
    }, [novels.length]);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + novels.length) % novels.length);
    }, [novels.length]);

    useEffect(() => {
        if (novels.length <= 1) return;
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [next, novels.length]);

    if (novels.length === 0) return null;

    const novel = novels[current];

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden group border border-border">
            <div className="absolute inset-0">
                {novel.coverUrl ? (
                    <Image
                        src={novel.coverUrl}
                        alt={novel.title}
                        fill
                        className="object-cover opacity-60"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority
                    />
                ) : null}
                {/* Gradient fallback when no cover image */}
                <div className={`absolute inset-0 ${novel.coverUrl ? "bg-neutral-900" : ""}`}
                    style={!novel.coverUrl ? {
                        background: `linear-gradient(135deg, hsl(${(novel.title.charCodeAt(0) * 37) % 360}, 60%, 25%), hsl(${(novel.title.charCodeAt(0) * 37 + 60) % 360}, 50%, 15%))`,
                    } : { zIndex: -1 }}
                />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 lg:p-8">
                {novel.averageRating && novel.averageRating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-sm font-semibold">{novel.averageRating.toFixed(1)}</span>
                    </div>
                )}

                <Link href={`/novel/${novel.id}`}>
                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold font-display text-white mb-1 hover:text-accent transition-[color] duration-300 leading-tight">
                        {novel.title}
                    </h2>
                </Link>

                <p className="text-white/70 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 max-w-lg mb-4 sm:mb-6">
                    {novel.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {novels.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`w-2 h-2 rounded-full transition-[background-color,width] duration-300 ${idx === current ? "bg-surface w-6" : "bg-white/40 hover:bg-white/60"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={prev}
                            aria-label="Previous slide"
                            className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-[background-color] duration-300 border border-white/20"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={next}
                            aria-label="Next slide"
                            className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-[background-color] duration-300 border border-white/20"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
