"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard, Users, BookOpen, Shield, Tag, Hash,
    FileText, Settings, Home, PanelLeftClose, PanelLeft, Megaphone, Star, BarChart3
} from "lucide-react";

interface StudioSidebarProps {
    studioToken: string;
}

interface MenuItem {
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    path: string;
    active: boolean;
}

interface MenuSection {
    label: string;
    items: MenuItem[];
}

export function StudioSidebar({ studioToken }: StudioSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + "/");
    };

    const sections: MenuSection[] = [
        {
            label: "Main",
            items: [
                { name: "Dashboard", icon: LayoutDashboard, path: `/studio?verify=${studioToken}`, active: pathname === "/studio" },
                { name: "Analytics", icon: BarChart3, path: `/studio/analytics?verify=${studioToken}`, active: isActive("/studio/analytics") },
                { name: "Users", icon: Users, path: `/studio/users?verify=${studioToken}`, active: isActive("/studio/users") },
            ],
        },
        {
            label: "Konten",
            items: [
                { name: "Content", icon: BookOpen, path: `/studio/content?verify=${studioToken}`, active: isActive("/studio/content") },
                { name: "Featured", icon: Star, path: `/studio/featured?verify=${studioToken}`, active: isActive("/studio/featured") },
                { name: "Moderation", icon: Shield, path: `/studio/moderation?verify=${studioToken}`, active: isActive("/studio/moderation") },
            ],
        },
        {
            label: "Taksonomi",
            items: [
                { name: "Categories", icon: Tag, path: `/studio/categories?verify=${studioToken}`, active: isActive("/studio/categories") },
                { name: "Tags", icon: Hash, path: `/studio/tags?verify=${studioToken}`, active: isActive("/studio/tags") },
            ],
        },
        {
            label: "Platform",
            items: [
                { name: "Reports", icon: FileText, path: `/studio/reports?verify=${studioToken}`, active: isActive("/studio/reports") },
                { name: "Pages", icon: FileText, path: `/studio/pages?verify=${studioToken}`, active: isActive("/studio/pages") },
                { name: "Announcements", icon: Megaphone, path: `/studio/announcements?verify=${studioToken}`, active: isActive("/studio/announcements") },
                { name: "Settings", icon: Settings, path: `/studio/settings?verify=${studioToken}`, active: isActive("/studio/settings") },
            ],
        },
    ];

    return (
        <aside
            className={`${isCollapsed ? "w-14" : "w-52"} bg-surface border-r border-border flex-shrink-0 transition-[width] duration-300 flex flex-col`}
        >
            {/* Header */}
            <div className="h-12 px-3 border-b border-border flex items-center justify-between">
                {!isCollapsed && (
                    <span className="font-bold text-sm text-accent tracking-tight">Studio</span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 hover:bg-bg rounded-md transition-[background-color] duration-200 text-muted"
                >
                    {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
                {sections.map((section, sectionIdx) => (
                    <div key={section.label}>
                        {/* Section Label */}
                        {!isCollapsed && (
                            <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
                                {section.label}
                            </p>
                        )}
                        {isCollapsed && sectionIdx > 0 && (
                            <div className="mx-1 mb-2 border-t border-border" />
                        )}

                        {/* Section Items */}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        title={isCollapsed ? item.name : undefined}
                                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-[background-color,color] duration-200 ${item.active
                                            ? "bg-accent/10 text-accent font-medium"
                                            : "text-fg/80 hover:bg-bg hover:text-fg"
                                            }`}
                                    >
                                        <Icon size={16} className={`shrink-0 ${item.active ? "text-accent" : "text-muted"}`} />
                                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-2 py-2 border-t border-border">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-muted hover:text-fg hover:bg-bg rounded-md transition-[background-color,color] duration-200"
                >
                    <Home size={16} />
                    {!isCollapsed && <span>Back to Site</span>}
                </Link>
            </div>
        </aside>
    );
}
