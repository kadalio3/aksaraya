"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, BookOpen, Calendar } from "lucide-react";
import { NovelStatusBadge } from "./novel-status-badge";

interface NovelCardProps {
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
        author?: {
            id?: string;
            name: string | null;
        } | null;
        translator: {
            id: string;
            name: string | null;
            email: string;
        };
        _count?: {
            chapters: number;
        };
    };
}

export function NovelCard({ novel }: NovelCardProps) {
    return (
        <Link href={`/novel/${novel.id}`} className="group block w-full">
            <div className="flex flex-col">
                <div className="relative w-full aspect-[3/4] bg-surface border border-border rounded-lg overflow-hidden group-hover:shadow-sm transition-[box-shadow] duration-300">
                    {novel.coverUrl ? (
                        <Image
                            src={novel.coverUrl}
                            alt={novel.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 160px"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10">
                            <BookOpen size={32} className="text-muted/40 mb-2" />
                            <span className="text-lg font-bold font-display text-muted/50">
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

                    {novel.averageRating && novel.totalRatings && novel.totalRatings > 0 && (
                        <div className="absolute top-1 right-1 bg-fg/80 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-bg text-[10px] font-semibold">
                                {novel.averageRating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-2 space-y-1">
                    <h3 className="font-semibold text-sm truncate text-fg leading-tight">
                        {novel.title}
                    </h3>

                    <p className="text-[11px] text-muted">{novel.author?.name || "Unknown Author"}</p>

                    {novel.genres && novel.genres.split(',').filter(Boolean).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {novel.genres.split(',').filter(Boolean).slice(0, 2).map((genre, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-muted/15 text-muted rounded text-[10px]">
                                    {genre.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    {novel.updateSchedule && (
                        <div className="flex items-center gap-1 text-[10px] text-muted" title={novel.updateSchedule}>
                            <Calendar size={10} />
                            <span className="truncate">{novel.updateSchedule}</span>
                        </div>
                    )}

                    {novel.totalChapters && novel._count?.chapters !== undefined && (
                        <div className="flex items-center gap-1 text-[10px] text-muted">
                            <BookOpen size={10} />
                            <span>{novel._count.chapters}/{novel.totalChapters} ch</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
