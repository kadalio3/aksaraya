"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, X, ArrowDownUp } from "lucide-react";

interface ReadingItem {
    novel: {
        id: string;
        title: string;
        coverUrl: string | null;
        status?: string | null;
        translator: {
            name: string | null;
        };
        _count: {
            chapters: number;
        };
    };
    chapter: {
        id: string;
        title: string;
        order: number;
    };
    progress: number; // scroll progress 0-100
    lastReadAt: Date;
}

interface ContinueReadingProps {
    readingProgress: ReadingItem[];
}

export function ContinueReading({ readingProgress }: ContinueReadingProps) {
    const [items, setItems] = useState<ReadingItem[]>(readingProgress);
    const [sortAsc, setSortAsc] = useState(false);

    const handleRemove = (novelId: string) => {
        setItems((prev) => prev.filter((p) => p.novel.id !== novelId));
    };

    const handleSort = () => {
        setSortAsc(!sortAsc);
        setItems((prev) => [...prev].sort((a, b) => {
            const ta = new Date(a.lastReadAt).getTime();
            const tb = new Date(b.lastReadAt).getTime();
            return sortAsc ? ta - tb : tb - ta;
        }));
    };

    if (items.length === 0) {
        return (
            <div className="bg-surface rounded-xl p-8 border border-border text-center">
                <BookOpen size={40} className="mx-auto mb-3 text-muted" />
                <h3 className="text-lg font-semibold text-fg mb-2">Belum Ada Riwayat Baca</h3>
                <p className="text-sm text-muted mb-4">Mulai membaca untuk melihat progress di sini</p>
                <Link href="/novel">
                    <Button variant="primary" size="sm">Browse Novel</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-muted" />
                    <h2 className="text-lg font-bold text-fg">Current Reads</h2>
                    <span className="text-xs text-muted bg-muted/10 px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
                <button
                    onClick={handleSort}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-fg border border-border rounded-lg px-3 py-1.5 transition-colors"
                >
                    <ArrowDownUp size={14} />
                    {sortAsc ? "Oldest First" : "Last Read"}
                </button>
            </div>

            {/* 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((progress) => {
                    const total = progress.novel._count.chapters;
                    const read = progress.chapter.order;
                    const percent = total > 0 ? Math.round((read / total) * 100) : 0;
                    const status = progress.novel.status || "ONGOING";
                    const statusLabel = status === "COMPLETED" ? "Completed" : status === "HIATUS" ? "Hiatus" : "Ongoing";

                    return (
                        <div
                            key={progress.novel.id}
                            className="bg-surface border border-border rounded-xl p-4 flex gap-3 group relative hover:border-muted transition-colors"
                        >
                            {/* Remove button */}
                            <button
                                onClick={() => handleRemove(progress.novel.id)}
                                className="absolute top-3 right-3 text-muted hover:text-fg transition-colors opacity-0 group-hover:opacity-100"
                                title="Hapus dari daftar"
                            >
                                <X size={16} />
                            </button>

                            {/* Cover with status badge */}
                            <Link href={`/novel/${progress.novel.id}`} className="flex-shrink-0 relative">
                                <div className="w-16 h-22 sm:w-18 sm:h-24 rounded-lg overflow-hidden bg-muted/10" style={{ width: 72, height: 96 }}>
                                    {progress.novel.coverUrl ? (
                                        <Image
                                            src={progress.novel.coverUrl}
                                            alt={progress.novel.title}
                                            width={72}
                                            height={96}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-xl font-bold text-muted">
                                                {progress.novel.title.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Status badge */}
                                <span className={`absolute top-0 left-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-tl-lg rounded-br-lg ${
                                    status === "COMPLETED"
                                        ? "bg-green-600 text-white"
                                        : status === "HIATUS"
                                        ? "bg-amber-600 text-white"
                                        : "bg-accent text-accent-fg"
                                }`}>
                                    {statusLabel}
                                </span>
                            </Link>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <Link href={`/novel/${progress.novel.id}`} className="hover:text-accent">
                                        <h3 className="font-bold text-sm text-fg leading-snug line-clamp-2">
                                            {progress.novel.title}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-muted mt-1">
                                        Ch. {read}/{total}
                                        {progress.progress > 0 && (
                                            <span className="ml-2 text-accent/70">· {progress.progress}% dibaca</span>
                                        )}
                                    </p>
                                </div>

                                {/* Chapter progress bar */}
                                <div className="mt-2 space-y-1">
                                    <div className="h-1 bg-muted/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent/40 rounded-full transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    {/* Scroll progress within current chapter */}
                                    {progress.progress > 0 && (
                                        <div className="h-1.5 bg-muted/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent rounded-full transition-all"
                                                style={{ width: `${progress.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Continue button */}
                                <div className="mt-2">
                                    <Link href={`/novel/${progress.novel.id}/chapter/${progress.chapter.id}`}>
                                        <Button variant="outline" size="sm" className="text-xs h-7 px-3">
                                            Continue Ch {read}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
