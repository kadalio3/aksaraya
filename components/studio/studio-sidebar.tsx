"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard, Users, BookOpen, Shield, Tag, Hash,
    FileText, Settings, Home, PanelLeftClose, PanelLeft, Megaphone, Star
} from "lucide-react";

interface StudioSidebarProps {
    studioToken: string;
}

export function StudioSidebar({ studioToken }: StudioSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + "/");
    };

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: `/studio?verify=${studioToken}`, active: pathname === "/studio" },
        { name: "Users", icon: Users, path: `/studio/users?verify=${studioToken}`, active: isActive("/studio/users") },
        { name: "Content", icon: BookOpen, path: `/studio/content?verify=${studioToken}`, active: isActive("/studio/content") },
        { name: "Featured", icon: Star, path: `/studio/featured?verify=${studioToken}`, active: isActive("/studio/featured") },
        { name: "Moderation", icon: Shield, path: `/studio/moderation?verify=${studioToken}`, active: isActive("/studio/moderation") },
        { name: "Categories", icon: Tag, path: `/studio/categories?verify=${studioToken}`, active: isActive("/studio/categories") },
        { name: "Tags", icon: Hash, path: `/studio/tags?verify=${studioToken}`, active: isActive("/studio/tags") },
        { name: "Reports", icon: FileText, path: `/studio/reports?verify=${studioToken}`, active: isActive("/studio/reports") },
        { name: "Pages", icon: FileText, path: `/studio/pages?verify=${studioToken}`, active: isActive("/studio/pages") },
        { name: "Announcements", icon: Megaphone, path: `/studio/announcements?verify=${studioToken}`, active: isActive("/studio/announcements") },
        { name: "Settings", icon: Settings, path: `/studio/settings?verify=${studioToken}`, active: isActive("/studio/settings") },
    ];

    return (
        <aside
            className={`${isCollapsed ? "w-16" : "w-56"} bg-surface border-r border-border flex-shrink-0 transition-[width] duration-300 flex flex-col`}
        >
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
                {!isCollapsed && (
                    <span className="font-bold text-sm text-fg">Studio</span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 hover:bg-bg rounded-md transition-[background-color] duration-300 text-muted"
                >
                    {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-sm transition-[background-color,color] duration-300 ${item.active
                                ? "bg-accent/10 text-accent font-medium"
                                : "text-fg hover:bg-bg"
                                }`}
                        >
                            <Icon size={18} className={item.active ? "text-accent" : "text-muted"} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-border">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-fg hover:bg-bg rounded-lg transition-[background-color,color] duration-300"
                >
                    <Home size={18} />
                    {!isCollapsed && <span>Back to Site</span>}
                </Link>
            </div>
        </aside>
    );
}
