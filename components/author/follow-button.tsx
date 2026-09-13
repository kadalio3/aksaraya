"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface FollowButtonProps {
    authorId: string;
    initialFollowing?: boolean;
    initialCount?: number;
    showCount?: boolean;
}

export function FollowButton({
    authorId,
    initialFollowing = false,
    initialCount = 0,
    showCount = true,
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [followersCount, setFollowersCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Fetch current follow status from API
        fetch(`/api/follow/status?followingId=${authorId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.isFollowing !== undefined) setIsFollowing(data.isFollowing);
                if (data.followersCount !== undefined) setFollowersCount(data.followersCount);
            })
            .catch(() => {});
    }, [authorId]);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/follow/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: authorId }),
            });

            if (res.status === 401) {
                window.location.href = "/login";
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setIsFollowing(data.isFollowing);
                setFollowersCount(data.followersCount);
            }
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            id={`follow-btn-${authorId}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                isFollowing
                    ? "bg-surface border-border text-fg hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800"
                    : "bg-accent border-accent text-accent-fg hover:opacity-90"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? (
                <Loader2 size={15} className="animate-spin" />
            ) : isFollowing ? (
                <UserCheck size={15} />
            ) : (
                <UserPlus size={15} />
            )}
            <span>{isFollowing ? "Mengikuti" : "Ikuti"}</span>
            {showCount && followersCount > 0 && (
                <span
                    className={`text-xs px-1.5 py-0.5 rounded-md ${
                        isFollowing ? "bg-border" : "bg-white/20"
                    }`}
                >
                    {followersCount}
                </span>
            )}
        </button>
    );
}
