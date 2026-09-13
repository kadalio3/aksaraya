"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserMenuProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        role?: string;
    };
    studioUrl?: string | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, studioUrl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get initials for avatar
    const getInitials = () => {
        if (user.name) {
            return user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return user.email?.[0].toUpperCase() || "U";
    };

    // Get avatar color based on user id
    const getAvatarColor = () => {
        const colors = [
            "bg-accent",
            "bg-accent",
            "bg-green-600",
            "bg-orange-600",
            "bg-cyan-600",
        ];
        const index = user.id.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none group"
            >
                {/* Avatar Circle */}
                <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white group-hover:ring-4 group-hover:ring-blue-200 transition-all duration-200`}
                >
                    {getInitials()}
                </div>

                {/* Name (hidden on mobile) */}
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-fg group-hover:text-indigo-600 transition-colors">
                        {user.name || "User"}
                    </span>
                    {user.role && (
                        <span className="text-xs text-muted capitalize">{user.role.toLowerCase()}</span>
                    )}
                </div>

                {/* Dropdown Arrow */}
                <svg
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-surface rounded-xl shadow-2xl border border-border py-2 z-50 animate-fade-in">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-fg">{user.name || "User"}</p>
                        <p className="text-xs text-muted truncate">{user.email}</p>
                        {user.role && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-accent rounded-full capitalize">
                                {user.role.toLowerCase()}
                            </span>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Dashboard
                        </Link>

                        {(user.role === "AUTHOR" || user.role === "ADMIN") && (
                            <Link
                                href="/dashboard/author"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                My Novels
                            </Link>
                        )}

                        <Link
                            href="/novel"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                            Browse Novels
                        </Link>

                        {user.role === "ADMIN" && studioUrl && (
                            <Link
                                href={studioUrl}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                Creator Studio
                            </Link>
                        )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-border pt-2">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
