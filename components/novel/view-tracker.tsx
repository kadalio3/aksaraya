"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
    chapterId: string;
    novelId: string;
}

/**
 * Invisible client component that fires a view increment
 * after 5 seconds on the page (to avoid counting bounces).
 * Rate limited server-side via cookie (1 view per chapter per 24h).
 */
export function ViewTracker({ chapterId, novelId }: ViewTrackerProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            fetch("/api/view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chapterId, novelId }),
            }).catch(() => {}); // silent fail
        }, 5000); // 5 second delay

        return () => clearTimeout(timer);
    }, [chapterId, novelId]);

    return null; // renders nothing
}
