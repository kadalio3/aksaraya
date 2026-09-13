"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

interface BookmarkButtonProps {
    chapterId: string;
    novelId: string;
    initialBookmarked?: boolean;
}

export function BookmarkButton({
    chapterId,
    novelId,
    initialBookmarked = false,
}: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/bookmark/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chapterId, novelId }),
            });

            if (res.status === 401) {
                window.location.href = "/login";
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setIsBookmarked(data.isBookmarked);
            }
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            id={`bookmark-btn-${chapterId}`}
            title={isBookmarked ? "Hapus bookmark" : "Bookmark chapter ini"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border ${
                isBookmarked
                    ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                    : "bg-surface border-border text-muted hover:text-fg hover:border-accent/40"
            } disabled:opacity-50`}
        >
            {loading ? (
                <Loader2 size={13} className="animate-spin" />
            ) : isBookmarked ? (
                <BookmarkCheck size={13} />
            ) : (
                <Bookmark size={13} />
            )}
            {isBookmarked ? "Dibookmark" : "Bookmark"}
        </button>
    );
}
