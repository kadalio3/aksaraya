"use client";

interface NovelStatusBadgeProps {
    status: "ONGOING" | "COMPLETED" | "HIATUS" | "DROPPED";
    className?: string;
}

export function NovelStatusBadge({ status, className = "" }: NovelStatusBadgeProps) {
    const statusConfig = {
        ONGOING: {
            label: "Ongoing",
            className: "bg-blue-100 text-accent border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
        },
        COMPLETED: {
            label: "Completed",
            className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
        },
        HIATUS: {
            label: "Hiatus",
            className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
        },
        DROPPED: {
            label: "Dropped",
            className: "bg-muted/15 text-muted border-border",
        },
    };

    const config = statusConfig[status] || statusConfig.ONGOING;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
        >
            {config.label}
        </span>
    );
}
