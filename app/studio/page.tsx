import prisma from "@/prisma";
import Link from "next/link";
import {
    Users, PenTool, BookOpen, FileText, Eye, Star,
    Heart, MessageSquare, TrendingUp, Clock, BarChart3
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function StudioPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const params = await searchParams;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Core stats
    const [
        totalUsers,
        totalNovels,
        totalChapters,
        totalTranslators,
        totalComments,
        totalRatings,
        totalFavorites,
        totalViews,
        // Time-based
        newUsers7d,
        newUsers30d,
        newChapters7d,
        newChapters30d,
        newComments7d,
        publishedChapters,
        draftChapters,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.novel.count(),
        prisma.chapter.count(),
        prisma.user.count({ where: { role: "TRANSLATOR" } }),
        prisma.comment.count(),
        prisma.rating.count(),
        prisma.favorite.count(),
        prisma.novel.aggregate({ _sum: { views: true } }),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.chapter.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.chapter.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.comment.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.chapter.count({ where: { isPublished: true } }),
        prisma.chapter.count({ where: { isPublished: false } }),
    ]);

    // Top novels by views
    const topNovelsByViews = await prisma.novel.findMany({
        take: 5,
        orderBy: { views: "desc" },
        select: {
            id: true,
            title: true,
            views: true,
            status: true,
            _count: { select: { chapters: true, favorites: true } },
        },
    });

    // Top novels by rating
    const topNovelsByRating = await prisma.novel.findMany({
        take: 5,
        where: { totalRatings: { gt: 0 } },
        orderBy: { averageRating: "desc" },
        select: {
            id: true,
            title: true,
            averageRating: true,
            totalRatings: true,
        },
    });

    // Recent registrations
    const recentUsers = await prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Novel status breakdown
    const [ongoingNovels, completedNovels, hiatusNovels, droppedNovels] = await Promise.all([
        prisma.novel.count({ where: { status: "ONGOING" } }),
        prisma.novel.count({ where: { status: "COMPLETED" } }),
        prisma.novel.count({ where: { status: "HIATUS" } }),
        prisma.novel.count({ where: { status: "DROPPED" } }),
    ]);

    // User role breakdown
    const [normalUsers, adminUsers] = await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    // Top translators
    const topTranslators = await prisma.user.findMany({
        where: { role: "TRANSLATOR" },
        take: 5,
        include: {
            _count: { select: { novels: true } },
        },
        orderBy: { novels: { _count: "desc" } },
    });

    // Recent chapters
    const recentChapters = await prisma.chapter.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            order: true,
            isPublished: true,
            createdAt: true,
            wordCount: true,
            novel: { select: { id: true, title: true } },
        },
    });

    const totalViewsNum = totalViews._sum.views || 0;

    return (
        <>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Dashboard</h1>
                <p className="text-sm text-muted mt-1">Ringkasan platform dan analitik</p>
            </div>

            {/* Primary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: "Users", value: totalUsers, icon: Users, color: "text-blue-500", sub: `+${newUsers7d} minggu ini` },
                    { label: "Translators", value: totalTranslators, icon: PenTool, color: "text-purple-500", sub: `${normalUsers} readers` },
                    { label: "Novels", value: totalNovels, icon: BookOpen, color: "text-emerald-500", sub: `${ongoingNovels} ongoing` },
                    { label: "Chapters", value: totalChapters, icon: FileText, color: "text-amber-500", sub: `+${newChapters7d} minggu ini` },
                    { label: "Total Views", value: totalViewsNum.toLocaleString(), icon: Eye, color: "text-cyan-500", sub: `${totalNovels > 0 ? Math.round(totalViewsNum / totalNovels) : 0} avg/novel` },
                    { label: "Favorites", value: totalFavorites, icon: Heart, color: "text-rose-500", sub: `${totalRatings} ratings` },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-surface border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} className={stat.color} />
                                <span className="text-xs font-medium text-muted">{stat.label}</span>
                            </div>
                            <p className="text-xl font-bold text-fg">{stat.value}</p>
                            <p className="text-[11px] text-muted mt-1">{stat.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Row 2: Status Breakdown + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Novel Status Breakdown */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 size={14} className="text-muted" />
                            Status Novel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { label: "Ongoing", count: ongoingNovels, color: "bg-emerald-500", pct: totalNovels > 0 ? (ongoingNovels / totalNovels) * 100 : 0 },
                                { label: "Completed", count: completedNovels, color: "bg-blue-500", pct: totalNovels > 0 ? (completedNovels / totalNovels) * 100 : 0 },
                                { label: "Hiatus", count: hiatusNovels, color: "bg-yellow-500", pct: totalNovels > 0 ? (hiatusNovels / totalNovels) * 100 : 0 },
                                { label: "Dropped", count: droppedNovels, color: "bg-red-500", pct: totalNovels > 0 ? (droppedNovels / totalNovels) * 100 : 0 },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <span className="text-xs text-fg w-20">{item.label}</span>
                                    <div className="flex-1 bg-border/50 rounded-full h-2 overflow-hidden">
                                        <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                                    </div>
                                    <span className="text-xs text-muted w-8 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>

                        {/* Chapter publish ratio */}
                        <div className="mt-5 pt-4 border-t border-border">
                            <p className="text-xs text-muted mb-2">Chapter Status</p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-fg">{publishedChapters} Published</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span className="text-xs text-fg">{draftChapters} Draft</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity 7 Days */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp size={14} className="text-muted" />
                            Aktivitas 7 Hari Terakhir
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "User baru", value: newUsers7d, total: newUsers30d, label2: "30 hari", icon: Users, color: "text-blue-500" },
                                { label: "Chapter baru", value: newChapters7d, total: newChapters30d, label2: "30 hari", icon: FileText, color: "text-amber-500" },
                                { label: "Komentar baru", value: newComments7d, total: totalComments, label2: "total", icon: MessageSquare, color: "text-emerald-500" },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center shrink-0">
                                            <Icon size={14} className={item.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-fg">{item.value}</p>
                                            <p className="text-[11px] text-muted">{item.label}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-muted">{item.total}</p>
                                            <p className="text-[10px] text-muted/60">{item.label2}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick metrics */}
                        <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3">
                            <div className="bg-bg rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-fg">{totalNovels > 0 ? Math.round(totalChapters / totalNovels) : 0}</p>
                                <p className="text-[10px] text-muted">Avg Ch/Novel</p>
                            </div>
                            <div className="bg-bg rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-fg">{totalNovels > 0 && topNovelsByRating.length > 0 ? topNovelsByRating[0].averageRating?.toFixed(1) : "—"}</p>
                                <p className="text-[10px] text-muted">Best Rating</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Star size={14} className="text-muted" />
                            Aksi Cepat
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {[
                                { label: "Kelola Users", icon: Users, href: `/studio/users?verify=${params.verify}`, desc: `${totalUsers} users` },
                                { label: "Kelola Konten", icon: BookOpen, href: `/studio/content?verify=${params.verify}`, desc: `${totalNovels} novels, ${totalChapters} ch` },
                                { label: "Featured Novels", icon: Star, href: `/studio/featured?verify=${params.verify}`, desc: "Edit carousel" },
                                { label: "Moderasi", icon: MessageSquare, href: `/studio/moderation?verify=${params.verify}`, desc: `${totalComments} komentar` },
                                { label: "Pengumuman", icon: FileText, href: `/studio/announcements?verify=${params.verify}`, desc: "Buat pengumuman" },
                                { label: "Settings", icon: FileText, href: `/studio/settings?verify=${params.verify}`, desc: "Platform config" },
                            ].map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-fg hover:bg-bg transition-[background-color] duration-200"
                                    >
                                        <Icon size={14} className="text-muted shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <span className="text-sm">{action.label}</span>
                                            <p className="text-[11px] text-muted truncate">{action.desc}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Top Novels by Views */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Eye size={14} className="text-muted" />
                            Novel Terpopuler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topNovelsByViews.length > 0 ? topNovelsByViews.map((novel, i) => (
                                <Link
                                    key={novel.id}
                                    href={`/novel/${novel.id}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg transition-[background-color] duration-200"
                                >
                                    <span className={`text-xs font-bold w-5 text-center shrink-0 ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted"}`}>
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-fg truncate">{novel.title}</p>
                                        <p className="text-[11px] text-muted">{novel._count.chapters} ch · {novel._count.favorites} fav</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted shrink-0">
                                        <Eye size={11} />
                                        {novel.views.toLocaleString()}
                                    </div>
                                </Link>
                            )) : (
                                <p className="text-sm text-muted text-center py-4">Belum ada data</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Novels by Rating */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Star size={14} className="text-muted" />
                            Rating Tertinggi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topNovelsByRating.length > 0 ? topNovelsByRating.map((novel, i) => (
                                <Link
                                    key={novel.id}
                                    href={`/novel/${novel.id}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg transition-[background-color] duration-200"
                                >
                                    <span className={`text-xs font-bold w-5 text-center shrink-0 ${i === 0 ? "text-amber-500" : "text-muted"}`}>
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-fg truncate">{novel.title}</p>
                                        <p className="text-[11px] text-muted">{novel.totalRatings} reviews</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-amber-500 shrink-0">
                                        ⭐ {novel.averageRating?.toFixed(1)}
                                    </div>
                                </Link>
                            )) : (
                                <p className="text-sm text-muted text-center py-4">Belum ada rating</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Translators */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <PenTool size={14} className="text-muted" />
                            Top Translators
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topTranslators.length > 0 ? topTranslators.map((user, i) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-2"
                                >
                                    <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-fg truncate">{user.name || user.email}</p>
                                        <p className="text-[11px] text-muted">{user._count.novels} novel{user._count.novels !== 1 ? 's' : ''}</p>
                                    </div>
                                    <span className={`text-xs font-bold ${i === 0 ? "text-amber-500" : "text-muted"}`}>
                                        #{i + 1}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-sm text-muted text-center py-4">Belum ada translator</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 4: Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Registrations */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users size={14} className="text-muted" />
                            Registrasi Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between py-2 px-1">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                                            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-fg truncate">{user.name || "Unnamed"}</p>
                                            <p className="text-[11px] text-muted truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                            user.role === "ADMIN" ? "bg-red-500/10 text-red-400" :
                                            user.role === "TRANSLATOR" ? "bg-purple-500/10 text-purple-400" :
                                            "bg-muted/10 text-muted"
                                        }`}>
                                            {user.role}
                                        </span>
                                        <span className="text-[10px] text-muted">
                                            {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Chapters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock size={14} className="text-muted" />
                            Chapter Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {recentChapters.map((ch) => (
                                <Link
                                    key={ch.id}
                                    href={`/novel/${ch.novel.id}/chapter/${ch.id}`}
                                    className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-bg transition-[background-color] duration-200"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-fg truncate">
                                            Ch. {ch.order}: {ch.title}
                                        </p>
                                        <p className="text-[11px] text-muted truncate">{ch.novel.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                            ch.isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                                        }`}>
                                            {ch.isPublished ? "Published" : "Draft"}
                                        </span>
                                        {ch.wordCount > 0 && (
                                            <span className="text-[10px] text-muted">{ch.wordCount.toLocaleString()} kata</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
