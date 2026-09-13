"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
}

const TYPE_ICON: Record<string, string> = {
    NEW_CHAPTER: "📖",
    NEW_FOLLOWER: "👤",
    COMMENT_REPLY: "💬",
};

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/notification/list");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    // Poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const markAllRead = async () => {
        await fetch("/api/notification/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const markRead = async (id: string) => {
        await fetch("/api/notification/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const handleOpen = () => {
        setOpen((v) => !v);
        if (!open) fetchNotifications();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-lg hover:bg-bg transition-[background-color] duration-300"
                aria-label="Notifikasi"
                id="notification-bell-btn"
            >
                <Bell size={20} className="text-fg" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] flex flex-col bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="font-semibold text-sm text-fg">Notifikasi</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-accent hover:opacity-70 transition-[opacity] duration-200"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Bell size={32} className="text-muted/40" />
                                <p className="text-sm text-muted">Tidak ada notifikasi</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-[background-color] duration-200 ${
                                        notif.isRead ? "bg-transparent" : "bg-accent/5"
                                    }`}
                                >
                                    <span className="text-xl shrink-0 mt-0.5">
                                        {TYPE_ICON[notif.type] || "🔔"}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        {notif.link ? (
                                            <Link
                                                href={notif.link}
                                                onClick={() => {
                                                    if (!notif.isRead) markRead(notif.id);
                                                    setOpen(false);
                                                }}
                                                className="block"
                                            >
                                                <p className="text-xs font-semibold text-fg truncate">
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-muted mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            </Link>
                                        ) : (
                                            <>
                                                <p className="text-xs font-semibold text-fg truncate">
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-muted mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            </>
                                        )}
                                        <p className="text-[10px] text-muted/60 mt-1">
                                            {timeAgo(notif.createdAt)}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <button
                                            onClick={() => markRead(notif.id)}
                                            className="shrink-0 w-2 h-2 rounded-full bg-accent mt-1.5"
                                            title="Tandai sudah dibaca"
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
