"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ThumbsUp } from "lucide-react";
import { NovelStatusBadge } from "./novel-status-badge";

interface NovelListCardProps {
    novel: {
        id: string;
        title: string;
        description: string;
        coverUrl?: string | null;
        genres: string;
        status?: string;
        updateSchedule?: string | null;
        totalChapters?: number | null;
        averageRating?: number | null;
        totalRatings?: number;
        author: {
            id: string;
            name: string | null;
            email: string;
        };
        _count?: {
            chapters: number;
        };
    };
}

export function NovelListCard({ novel }: NovelListCardProps) {
    const ratingPercent = novel.averageRating
        ? Math.round((novel.averageRating / 5) * 100)
        : null;

    return (
        <Link href={`/novel/${novel.id}`} className="group flex gap-4 hover:bg-surface/50 rounded-xl p-2 -m-2 transition-[background-color] duration-300">
            {/* Cover */}
            <div className="relative w-[100px] sm:w-[120px] aspect-[3/4] bg-surface border border-border rounded-lg overflow-hidden shrink-0">
                {novel.coverUrl ? (
                    <Image
                        src={novel.coverUrl}
                        alt={novel.title}
                        fill
                        className="object-cover"
                        sizes="120px"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10">
                        <BookOpen size={24} className="text-muted/40 mb-1" />
                        <span className="text-sm font-bold font-display text-muted/50">
                            {novel.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {novel.status && (
                    <div className="absolute top-1 left-1">
                        <NovelStatusBadge
                            status={novel.status as "ONGOING" | "COMPLETED" | "HIATUS" | "DROPPED"}
                            className="text-[9px] px-1.5 py-0.5"
                        />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-1">
                <h3 className="font-bold text-fg text-base leading-snug group-hover:text-accent transition-[color] duration-300">
                    {novel.title}
                </h3>

                {ratingPercent !== null && novel.totalRatings && novel.totalRatings > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-muted text-xs">
                        <ThumbsUp size={12} />
                        <span>{ratingPercent}%</span>
                    </div>
                )}

                <p className="text-muted text-sm line-clamp-3 mt-1.5 leading-relaxed">
                    {novel.description}
                </p>

                {novel.genres && novel.genres.split(',').filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {novel.genres.split(',').filter(Boolean).slice(0, 3).map((genre, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-surface border border-border text-muted rounded-md text-xs">
                                {genre.trim()}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
