"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "./button";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";

interface NavbarProps {
    user?: {
        id: string;
        name?: string | null;
        email?: string;
        role?: string;
    } | null;
    studioUrl?: string | null;
    siteName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, studioUrl, siteName = "NovelHub" }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    const isActive = (path: string) => {
        return pathname === path ? "text-accent font-semibold" : "text-fg hover:text-accent";
    };

    const navLinks = [
        { href: "/", label: "Beranda", show: true },
        { href: "/novel", label: "Jelajahi", show: true },
        { href: "/dashboard", label: "Dashboard", show: !!user },
        { href: "/dashboard/author", label: "Novel Saya", show: user?.role === "TRANSLATOR" || user?.role === "ADMIN" },
        { href: studioUrl || "", label: "Studio", show: user?.role === "ADMIN" && !!studioUrl },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setMobileMenuOpen(false);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="text-xl sm:text-2xl font-bold font-display text-fg">
                            {siteName}
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) =>
                            link.show && (
                                <Link key={link.href} href={link.href} className={`transition-[color] duration-300 text-sm ${isActive(link.href)}`}>
                                    {link.label}
                                </Link>
                            )
                        )}
                    </div>

                    {/* Search bar — navigates to /search */}
                    <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-sm mx-6">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari novel, penulis..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-bg text-fg text-sm focus:border-accent focus:outline-none transition-[border-color] duration-300"
                            />
                        </div>
                    </form>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {/* Notification Bell — only for logged in users */}
                        {user && <NotificationBell />}

                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <UserMenu user={user} />
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="outline" size="sm">Login</Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button variant="primary" size="sm">Sign Up</Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-bg transition-[background-color] duration-300"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-surface">
                    <div className="px-4 py-3 space-y-3">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari novel, penulis..."
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-bg text-fg text-sm focus:border-accent focus:outline-none"
                                />
                            </div>
                        </form>
                        {navLinks.map((link) =>
                            link.show && (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block py-2 px-3 rounded-lg transition-[color,background-color] duration-300 ${pathname === link.href
                                        ? "bg-accent/10 text-accent font-semibold"
                                        : "text-fg hover:bg-bg"
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            )
                        )}

                        {!user && (
                            <div className="pt-3 border-t border-border space-y-2">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                                    <Button variant="primary" className="w-full">Sign Up</Button>
                                </Link>
                            </div>
                        )}

                        {user && (
                            <div className="pt-3 border-t border-border">
                                <div className="text-sm text-muted mb-2">
                                    Masuk sebagai <span className="font-semibold text-fg">{user.name || user.email}</span>
                                </div>
                                <Link href="/api/auth/signout" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Logout</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
