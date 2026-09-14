import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import prisma from "@/prisma";
import Link from "next/link";
import {
    Users, BookOpen, FileText, Eye, Star, Heart,
    MessageSquare, TrendingUp, BarChart3, Clock, PenTool
} from "lucide-react";

export default async function StudioReportsPage() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Comprehensive analytics
    const [
        totalUsers, totalNovels, totalChapters, totalComments,
        totalRatings, totalFavorites, totalFollows, totalBookmarks,
        totalViews, totalWordCount,
        // Time-based
        users7d, users30d, chapters7d, chapters30d,
        comments7d, comments30d, ratings30d, favorites30d,
        // Status breakdown
        publishedChapters, draftChapters,
        ongoingNovels, completedNovels, hiatusNovels, droppedNovels,
        // Role breakdown
        normalUsers, translatorUsers, adminUsers,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.novel.count(),
        prisma.chapter.count(),
        prisma.comment.count(),
        prisma.rating.count(),
        prisma.favorite.count(),
        prisma.follow.count(),
        prisma.bookmark.count(),
        prisma.novel.aggregate({ _sum: { views: true } }),
        prisma.chapter.aggregate({ _sum: { wordCount: true } }),
        // Time-based
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.chapter.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.chapter.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.comment.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.comment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.rating.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.favorite.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        // Status
        prisma.chapter.count({ where: { isPublished: true } }),
        prisma.chapter.count({ where: { isPublished: false } }),
        prisma.novel.count({ where: { status: "ONGOING" } }),
        prisma.novel.count({ where: { status: "COMPLETED" } }),
        prisma.novel.count({ where: { status: "HIATUS" } }),
        prisma.novel.count({ where: { status: "DROPPED" } }),
        // Roles
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "TRANSLATOR" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    // Top novels
    const topNovelsByViews = await prisma.novel.findMany({
        take: 10,
        orderBy: { views: "desc" },
        select: {
            id: true, title: true, views: true, status: true, averageRating: true,
            _count: { select: { chapters: true, favorites: true, ratings: true } },
            translator: { select: { name: true } },
        },
    });

    // Most favorited
    const topNovelsByFavorites = await prisma.novel.findMany({
        take: 10,
        orderBy: { favorites: { _count: "desc" } },
        select: {
            id: true, title: true, views: true,
            _count: { select: { favorites: true, chapters: true } },
        },
    });

    // Top translators
    const topTranslators = await prisma.user.findMany({
        where: { role: "TRANSLATOR" },
        take: 10,
        include: {
            _count: { select: { novels: true, followers: true } },
        },
        orderBy: { novels: { _count: "desc" } },
    });

    const totalViewsNum = totalViews._sum.views || 0;
    const totalWords = totalWordCount._sum.wordCount || 0;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Reports & Analytics</h1>
                <p className="text-sm text-muted mt-1">Analitik platform secara menyeluruh</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                {[
                    { label: "Total Users", value: totalUsers, sub: `+${users30d} bulan ini`, icon: Users, color: "text-blue-500" },
                    { label: "Total Novels", value: totalNovels, sub: `${ongoingNovels} ongoing`, icon: BookOpen, color: "text-emerald-500" },
                    { label: "Total Chapters", value: totalChapters, sub: `+${chapters30d} bulan ini`, icon: FileText, color: "text-amber-500" },
                    { label: "Total Views", value: totalViewsNum.toLocaleString(), sub: `${totalNovels > 0 ? Math.round(totalViewsNum / totalNovels) : 0} avg`, icon: Eye, color: "text-cyan-500" },
                    { label: "Total Words", value: totalWords > 1000000 ? `${(totalWords / 1000000).toFixed(1)}M` : totalWords > 1000 ? `${(totalWords / 1000).toFixed(0)}K` : totalWords.toString(), sub: `${totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0} avg/ch`, icon: FileText, color: "text-purple-500" },
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

            {/* Engagement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Comments", value: totalComments, sub: `+${comments30d} bulan ini`, icon: MessageSquare, color: "text-emerald-500" },
                    { label: "Ratings", value: totalRatings, sub: `+${ratings30d} bulan ini`, icon: Star, color: "text-amber-500" },
                    { label: "Favorites", value: totalFavorites, sub: `+${favorites30d} bulan ini`, icon: Heart, color: "text-rose-500" },
                    { label: "Follows", value: totalFollows, sub: `${totalBookmarks} bookmarks`, icon: Users, color: "text-blue-500" },
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

            {/* Breakdown Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Novel Status */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 size={14} className="text-muted" />
                            Novel Status Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { label: "Ongoing", count: ongoingNovels, color: "bg-emerald-500" },
                                { label: "Completed", count: completedNovels, color: "bg-blue-500" },
                                { label: "Hiatus", count: hiatusNovels, color: "bg-yellow-500" },
                                { label: "Dropped", count: droppedNovels, color: "bg-red-500" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                                    <span className="text-sm text-fg flex-1">{item.label}</span>
                                    <span className="text-sm font-medium text-fg">{item.count}</span>
                                    <span className="text-xs text-muted w-12 text-right">
                                        {totalNovels > 0 ? Math.round((item.count / totalNovels) * 100) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Chapter Status */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <FileText size={14} className="text-muted" />
                            Chapter Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold text-emerald-500">{publishedChapters}</p>
                                <p className="text-xs text-muted">Published</p>
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold text-yellow-500">{draftChapters}</p>
                                <p className="text-xs text-muted">Draft</p>
                            </div>
                        </div>
                        <div className="bg-border/50 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${totalChapters > 0 ? (publishedChapters / totalChapters) * 100 : 0}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-muted mt-2 text-center">
                            {totalChapters > 0 ? Math.round((publishedChapters / totalChapters) * 100) : 0}% published
                        </p>
                    </CardContent>
                </Card>

                {/* User Roles */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users size={14} className="text-muted" />
                            User Roles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { label: "Readers", count: normalUsers, color: "bg-blue-500" },
                                { label: "Translators", count: translatorUsers, color: "bg-purple-500" },
                                { label: "Admins", count: adminUsers, color: "bg-red-500" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                                    <span className="text-sm text-fg flex-1">{item.label}</span>
                                    <span className="text-sm font-medium text-fg">{item.count}</span>
                                    <span className="text-xs text-muted w-12 text-right">
                                        {totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border">
                            <div className="flex items-center justify-between text-xs text-muted">
                                <span>Baru minggu ini</span>
                                <span className="font-medium text-fg">+{users7d}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted mt-1">
                                <span>Baru bulan ini</span>
                                <span className="font-medium text-fg">+{users30d}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Top Novels by Views */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp size={14} className="text-muted" />
                            Top 10 Novel (Views)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-1 text-xs text-muted font-medium">#</th>
                                        <th className="text-left py-2 px-1 text-xs text-muted font-medium">Novel</th>
                                        <th className="text-right py-2 px-1 text-xs text-muted font-medium">Views</th>
                                        <th className="text-right py-2 px-1 text-xs text-muted font-medium">Ch</th>
                                        <th className="text-right py-2 px-1 text-xs text-muted font-medium">Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topNovelsByViews.map((novel, i) => (
                                        <tr key={novel.id} className="border-b border-border/50 last:border-0">
                                            <td className="py-2 px-1 text-xs text-muted">{i + 1}</td>
                                            <td className="py-2 px-1">
                                                <Link href={`/novel/${novel.id}`} className="text-fg hover:text-accent transition-colors truncate block max-w-[200px]">
                                                    {novel.title}
                                                </Link>
                                                <p className="text-[10px] text-muted">{novel.translator.name || "Unknown"}</p>
                                            </td>
                                            <td className="py-2 px-1 text-right text-xs">{novel.views.toLocaleString()}</td>
                                            <td className="py-2 px-1 text-right text-xs text-muted">{novel._count.chapters}</td>
                                            <td className="py-2 px-1 text-right text-xs">
                                                {novel.averageRating ? `⭐${novel.averageRating.toFixed(1)}` : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-1 text-xs text-muted font-medium">#</th>
                                        <th className="text-left py-2 px-1 text-xs text-muted font-medium">Translator</th>
                                        <th className="text-right py-2 px-1 text-xs text-muted font-medium">Novels</th>
                                        <th className="text-right py-2 px-1 text-xs text-muted font-medium">Followers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topTranslators.map((user, i) => (
                                        <tr key={user.id} className="border-b border-border/50 last:border-0">
                                            <td className="py-2 px-1 text-xs text-muted">{i + 1}</td>
                                            <td className="py-2 px-1">
                                                <p className="text-fg truncate max-w-[200px]">{user.name || "Unnamed"}</p>
                                                <p className="text-[10px] text-muted">{user.email}</p>
                                            </td>
                                            <td className="py-2 px-1 text-right text-xs font-medium">{user._count.novels}</td>
                                            <td className="py-2 px-1 text-right text-xs text-muted">{user._count.followers}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Most Favorited */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Heart size={14} className="text-muted" />
                        Most Favorited Novels
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {topNovelsByFavorites.map((novel, i) => (
                            <Link
                                key={novel.id}
                                href={`/novel/${novel.id}`}
                                className="bg-bg rounded-lg p-3 hover:bg-border/30 transition-[background-color] duration-200 text-center"
                            >
                                <p className={`text-lg font-bold mb-1 ${i === 0 ? "text-amber-500" : "text-muted"}`}>#{i + 1}</p>
                                <p className="text-sm font-medium text-fg line-clamp-2 mb-2">{novel.title}</p>
                                <div className="flex items-center justify-center gap-3 text-xs text-muted">
                                    <span className="flex items-center gap-1"><Heart size={10} className="text-rose-400" /> {novel._count.favorites}</span>
                                    <span>{novel._count.chapters} ch</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
