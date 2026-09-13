"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

interface RecentUpdate {
    chapterId: string;
    chapterTitle: string;
    chapterOrder: number;
    publishedAt: string;
    novelId: string;
    novelTitle: string;
    novelCoverUrl: string | null;
    novelGenres: string;
}

interface RecentUpdatesListProps {
    updates: RecentUpdate[];
}

function timeAgo(dateStr: string) {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;

    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    const months = Math.floor(days / 30);
    return `${months} bulan lalu`;
}

const PAGE_SIZE = 6;

export function RecentUpdatesList({ updates }: RecentUpdatesListProps) {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(updates.length / PAGE_SIZE);
    const visible = updates.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (updates.length === 0) return null;

    return (
        <div>
            {/* List */}
            <div className="divide-y divide-border">
                {visible.map((item, idx) => (
                    <Link
                        key={`${item.chapterId}-${idx}`}
                        href={`/novel/${item.novelId}/chapter/${item.chapterId}`}
                        className="flex items-center gap-3 py-3 px-1 hover:bg-surface/50 transition-colors rounded-lg group"
                    >
                        {/* Cover thumbnail */}
                        <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted/10 border border-border">
                            {item.novelCoverUrl ? (
                                <Image
                                    src={item.novelCoverUrl}
                                    alt={item.novelTitle}
                                    width={48}
                                    height={64}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen size={16} className="text-muted/40" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-fg truncate group-hover:text-accent transition-colors">
                                {item.novelTitle}
                            </h4>
                            <p className="text-xs text-muted truncate mt-0.5">
                                Chapter {item.chapterOrder}: {item.chapterTitle}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted/70">
                                <Clock size={10} />
                                <span>{timeAgo(item.publishedAt)}</span>
                                <span className="mx-1">·</span>
                                <span>{item.novelGenres.split(",")[0]?.trim() || "Novel"}</span>
                            </div>
                        </div>

                        {/* Cover small on right (desktop) */}
                        <div className="hidden sm:block w-12 h-16 rounded-md overflow-hidden flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                            {item.novelCoverUrl && (
                                <Image
                                    src={item.novelCoverUrl}
                                    alt=""
                                    width={48}
                                    height={64}
                                    className="object-cover w-full h-full"
                                />
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Dots pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            aria-label={`Page ${i + 1}`}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i === page
                                    ? "bg-accent w-5"
                                    : "bg-muted/30 hover:bg-muted/50"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
