"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Search, ArrowUpDown, Calendar, MessageSquare, ChevronRight, BookOpen } from "lucide-react";

interface Chapter {
    id: string;
    title: string;
    order: number;
    isPublished: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    _count?: {
        comments?: number;
    };
}

interface ChapterListProps {
    chapters: Chapter[];
    novelId: string;
    isAuthor?: boolean;
    currentChapterId?: string;
    readingProgress?: {
        chapterId: string;
        progress: number;
    } | null;
}

export const ChapterList: React.FC<ChapterListProps> = ({
    chapters,
    novelId,
    isAuthor = false,
    currentChapterId,
    readingProgress,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

    const visibleChapters = isAuthor
        ? chapters
        : chapters.filter(c => c.isPublished);

    const sortedChapters = [...visibleChapters].sort((a, b) =>
        sortOrder === "asc" ? a.order - b.order : b.order - a.order
    );

    const filteredChapters = sortedChapters.filter((chapter) => {
        const matchesSearch = chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `Chapter ${chapter.order}`.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "published" && chapter.isPublished) ||
            (filterStatus === "draft" && !chapter.isPublished);

        return matchesSearch && matchesStatus;
    });

    const totalChapters = visibleChapters.length;
    const draftCount = visibleChapters.filter(c => !c.isPublished).length;

    if (totalChapters === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen size={32} className="mx-auto text-muted/40 mb-3" />
                <p className="text-fg font-medium">Belum ada chapter</p>
                {isAuthor && (
                    <p className="text-muted text-sm mt-1">Mulai menulis chapter pertama Anda!</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Search chapters..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-surface text-fg text-sm focus:border-accent focus:outline-none transition-[border-color] duration-300"
                    />
                </div>

                {/* Filter by Status - only for authors */}
                {isAuthor && (
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-3 py-2 border border-border rounded-lg bg-surface text-fg text-sm focus:border-accent focus:outline-none"
                    >
                        <option value="all">All ({totalChapters})</option>
                        <option value="published">Published ({totalChapters - draftCount})</option>
                        <option value="draft">Drafts ({draftCount})</option>
                    </select>
                )}

                {/* Sort Order */}
                <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2 border border-border rounded-lg text-sm text-fg hover:bg-surface transition-[background-color] duration-300 flex items-center gap-2"
                >
                    <ArrowUpDown size={14} />
                    {sortOrder === "asc" ? "Oldest" : "Newest"}
                </button>
            </div>

            {/* Results count */}
            <p className="text-xs text-muted">
                {filteredChapters.length} of {totalChapters} chapters
            </p>

            {/* Chapter List */}
            {filteredChapters.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted text-sm">No chapters found</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {filteredChapters.map((chapter) => {
                        const isCurrentChapter = currentChapterId === chapter.id;
                        const isLastRead = readingProgress?.chapterId === chapter.id;

                        return (
                            <Link
                                key={chapter.id}
                                href={
                                    isAuthor
                                        ? `/novel/${novelId}/chapter/${chapter.id}/edit`
                                        : `/novel/${novelId}/chapter/${chapter.id}`
                                }
                                className="block"
                            >
                                <div
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-[background-color,border-color] duration-300 group
                                        ${isCurrentChapter
                                            ? "bg-accent/10 border border-accent"
                                            : isLastRead
                                                ? "bg-surface border border-accent/30"
                                                : "hover:bg-surface border border-transparent"
                                        }`}
                                >
                                    {/* Chapter Number */}
                                    <span className={`text-sm font-medium tabular-nums w-8 text-center shrink-0 ${isCurrentChapter ? "text-accent" : "text-muted"
                                        }`}>
                                        {chapter.order}
                                    </span>

                                    {/* Chapter Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-fg group-hover:text-accent transition-[color] duration-300 truncate">
                                            {chapter.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={11} />
                                                {chapter.publishedAt
                                                    ? formatDate(chapter.publishedAt)
                                                    : formatDate(chapter.createdAt)}
                                            </span>
                                            {chapter._count?.comments && chapter._count.comments > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare size={11} />
                                                    {chapter._count.comments}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status badges */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isLastRead && !isCurrentChapter && (
                                            <span className="text-[10px] text-accent font-medium">Last read</span>
                                        )}
                                        {isCurrentChapter && (
                                            <span className="text-[10px] text-accent font-medium">Reading</span>
                                        )}
                                        {isAuthor && !chapter.isPublished && (
                                            <Badge variant="warning" size="sm">Draft</Badge>
                                        )}
                                        <ChevronRight size={14} className="text-muted group-hover:text-accent transition-[color] duration-300" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
