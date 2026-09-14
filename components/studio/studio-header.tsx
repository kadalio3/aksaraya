"use client";

import { usePathname } from "next/navigation";

interface StudioHeaderProps {
    user: {
        name: string | null;
        email: string;
        role: string;
    };
}

const pageTitles: Record<string, string> = {
    "/studio": "Dashboard",
    "/studio/analytics": "Visitor Analytics",
    "/studio/users": "User Management",
    "/studio/content": "Content Management",
    "/studio/featured": "Featured Novels",
    "/studio/moderation": "Content Moderation",
    "/studio/categories": "Genre Management",
    "/studio/tags": "Tag Management",
    "/studio/reports": "Reports & Analytics",
    "/studio/pages": "Halaman",
    "/studio/announcements": "Pengumuman",
    "/studio/settings": "Settings",
    "/studio/novels": "Novel Management",
    "/studio/chapters": "Chapter Management",
};

export function StudioHeader({ user }: StudioHeaderProps) {
    const pathname = usePathname();

    // Find the matching page title
    const pageTitle = Object.entries(pageTitles).find(
        ([path]) => pathname === path || pathname.startsWith(path + "/")
    )?.[1] || "Studio";

    return (
        <header className="bg-surface border-b border-border sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 h-12">
                {/* Breadcrumb / Page Title */}
                <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="text-muted">Studio</span>
                    <span className="text-muted/40">/</span>
                    <span className="font-medium text-fg truncate">{pageTitle}</span>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="min-w-0 hidden sm:block text-right">
                        <p className="text-[13px] font-medium text-fg truncate leading-tight">
                            {user.name || user.email}
                        </p>
                        <p className="text-[11px] text-muted leading-tight">{user.role}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}
