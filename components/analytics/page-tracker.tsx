"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTracker() {
    const pathname = usePathname();
    const lastTracked = useRef("");

    useEffect(() => {
        // Don't track studio pages or API routes
        if (pathname.startsWith("/studio") || pathname.startsWith("/api")) {
            return;
        }

        // Don't track the same path twice in a row
        if (lastTracked.current === pathname) {
            return;
        }

        lastTracked.current = pathname;

        // Send tracking request (fire-and-forget)
        const track = async () => {
            try {
                await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: pathname,
                        referer: document.referrer || null,
                    }),
                });
            } catch {
                // Silently fail - analytics should never break the app
            }
        };

        // Delay slightly to not block page rendering
        const timer = setTimeout(track, 100);
        return () => clearTimeout(timer);
    }, [pathname]);

    return null; // Invisible component
}
