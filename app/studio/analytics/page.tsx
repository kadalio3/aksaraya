import prisma from "@/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Eye, Users, Globe, Monitor, Smartphone, Tablet,
    TrendingUp, Clock, BarChart3, Chrome
} from "lucide-react";

export default async function StudioAnalyticsPage() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Core metrics
    const [totalViews, viewsToday, views7d, views30d] = await Promise.all([
        prisma.pageView.count(),
        prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    // Unique visitors (by sessionId)
    const [uniqueToday, unique7d, unique30d] = await Promise.all([
        prisma.pageView.groupBy({
            by: ["sessionId"],
            where: { createdAt: { gte: todayStart }, sessionId: { not: null } },
        }).then(r => r.length),
        prisma.pageView.groupBy({
            by: ["sessionId"],
            where: { createdAt: { gte: sevenDaysAgo }, sessionId: { not: null } },
        }).then(r => r.length),
        prisma.pageView.groupBy({
            by: ["sessionId"],
            where: { createdAt: { gte: thirtyDaysAgo }, sessionId: { not: null } },
        }).then(r => r.length),
    ]);

    // Device breakdown (30d)
    const deviceStats = await prisma.pageView.groupBy({
        by: ["device"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: true,
        orderBy: { _count: { device: "desc" } },
    });

    // Browser breakdown (30d)
    const browserStats = await prisma.pageView.groupBy({
        by: ["browser"],
        where: { createdAt: { gte: thirtyDaysAgo }, browser: { not: null } },
        _count: true,
        orderBy: { _count: { browser: "desc" } },
    });

    // OS breakdown (30d)
    const osStats = await prisma.pageView.groupBy({
        by: ["os"],
        where: { createdAt: { gte: thirtyDaysAgo }, os: { not: null } },
        _count: true,
        orderBy: { _count: { os: "desc" } },
    });

    // Country breakdown (30d)
    const countryStats = await prisma.pageView.groupBy({
        by: ["country"],
        where: { createdAt: { gte: thirtyDaysAgo }, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: "desc" } },
    });

    // Top pages (30d)
    const topPages = await prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: true,
        orderBy: { _count: { path: "desc" } },
        take: 15,
    });

    // Daily views for the last 14 days
    const dailyViews: { date: string; views: number; unique: number }[] = [];
    for (let i = 13; i >= 0; i--) {
        const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const [views, uniqueVisitors] = await Promise.all([
            prisma.pageView.count({
                where: { createdAt: { gte: dayStart, lte: dayEnd } },
            }),
            prisma.pageView.groupBy({
                by: ["sessionId"],
                where: { createdAt: { gte: dayStart, lte: dayEnd }, sessionId: { not: null } },
            }).then(r => r.length),
        ]);

        dailyViews.push({
            date: dayStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
            views,
            unique: uniqueVisitors,
        });
    }

    const maxDailyViews = Math.max(...dailyViews.map(d => d.views), 1);
    const totalDeviceViews = deviceStats.reduce((sum, d) => sum + d._count, 0) || 1;

    const deviceIcons: Record<string, React.ReactNode> = {
        Desktop: <Monitor size={14} className="text-blue-500" />,
        Mobile: <Smartphone size={14} className="text-emerald-500" />,
        Tablet: <Tablet size={14} className="text-amber-500" />,
    };

    const deviceColors: Record<string, string> = {
        Desktop: "bg-blue-500",
        Mobile: "bg-emerald-500",
        Tablet: "bg-amber-500",
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Visitor Analytics</h1>
                <p className="text-sm text-muted mt-1">Statistik pengunjung dan traffic platform</p>
            </div>

            {/* Primary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Views Hari Ini", views: viewsToday, unique: uniqueToday, icon: Eye, color: "text-blue-500" },
                    { label: "Views 7 Hari", views: views7d, unique: unique7d, icon: TrendingUp, color: "text-emerald-500" },
                    { label: "Views 30 Hari", views: views30d, unique: unique30d, icon: BarChart3, color: "text-amber-500" },
                    { label: "Total Views", views: totalViews, unique: null, icon: Eye, color: "text-purple-500" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-surface border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} className={stat.color} />
                                <span className="text-xs font-medium text-muted">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-fg">{stat.views.toLocaleString()}</p>
                            {stat.unique !== null && (
                                <p className="text-[11px] text-muted mt-1">
                                    <Users size={10} className="inline mr-1" />
                                    {stat.unique.toLocaleString()} unique visitors
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Daily Traffic Chart */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp size={14} className="text-muted" />
                        Traffic 14 Hari Terakhir
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1.5 h-40">
                        {dailyViews.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                {/* Bar */}
                                <div className="w-full flex flex-col items-center relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 bg-surface border border-border rounded-md px-2 py-1 text-[10px] text-fg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {day.views} views · {day.unique} unique
                                    </div>
                                    <div
                                        className="w-full bg-accent/20 hover:bg-accent/30 rounded-t transition-[background-color,height] duration-200 min-h-[4px] relative"
                                        style={{ height: `${Math.max((day.views / maxDailyViews) * 130, 4)}px` }}
                                    >
                                        {/* Unique overlay */}
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-accent rounded-t"
                                            style={{ height: `${day.views > 0 ? Math.max((day.unique / day.views) * 100, 10) : 0}%` }}
                                        />
                                    </div>
                                </div>
                                {/* Label */}
                                <span className="text-[9px] text-muted rotate-0 truncate w-full text-center">
                                    {day.date}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-muted">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-2 bg-accent/20 rounded-sm" />
                            <span>Total Views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-2 bg-accent rounded-sm" />
                            <span>Unique Visitors</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Device + Browser + OS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Device */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Monitor size={14} className="text-muted" />
                            Device
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deviceStats.length > 0 ? (
                            <>
                                {/* Device bar */}
                                <div className="flex rounded-full h-3 overflow-hidden mb-4">
                                    {deviceStats.map((d) => (
                                        <div
                                            key={d.device}
                                            className={`${deviceColors[d.device || "Desktop"] || "bg-gray-500"} transition-all`}
                                            style={{ width: `${(d._count / totalDeviceViews) * 100}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-2.5">
                                    {deviceStats.map((d) => (
                                        <div key={d.device} className="flex items-center gap-2.5">
                                            {deviceIcons[d.device || "Desktop"] || <Monitor size={14} className="text-muted" />}
                                            <span className="text-sm text-fg flex-1">{d.device || "Unknown"}</span>
                                            <span className="text-sm font-medium text-fg">{d._count}</span>
                                            <span className="text-xs text-muted w-10 text-right">
                                                {Math.round((d._count / totalDeviceViews) * 100)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted text-center py-6">Belum ada data</p>
                        )}
                    </CardContent>
                </Card>

                {/* Browser */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Chrome size={14} className="text-muted" />
                            Browser
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {browserStats.length > 0 ? (
                            <div className="space-y-2">
                                {browserStats.slice(0, 6).map((b) => {
                                    const maxBrowser = browserStats[0]?._count || 1;
                                    return (
                                        <div key={b.browser} className="flex items-center gap-2.5">
                                            <span className="text-sm text-fg w-20 truncate">{b.browser}</span>
                                            <div className="flex-1 bg-border/50 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-blue-500 h-full rounded-full"
                                                    style={{ width: `${(b._count / maxBrowser) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted w-8 text-right">{b._count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted text-center py-6">Belum ada data</p>
                        )}
                    </CardContent>
                </Card>

                {/* OS */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Monitor size={14} className="text-muted" />
                            Operating System
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {osStats.length > 0 ? (
                            <div className="space-y-2">
                                {osStats.slice(0, 6).map((o) => {
                                    const maxOS = osStats[0]?._count || 1;
                                    return (
                                        <div key={o.os} className="flex items-center gap-2.5">
                                            <span className="text-sm text-fg w-20 truncate">{o.os}</span>
                                            <div className="flex-1 bg-border/50 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-purple-500 h-full rounded-full"
                                                    style={{ width: `${(o._count / maxOS) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted w-8 text-right">{o._count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted text-center py-6">Belum ada data</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Country + Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Country */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Globe size={14} className="text-muted" />
                            Negara Pengunjung (30 Hari)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {countryStats.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 text-xs text-muted font-medium">#</th>
                                            <th className="text-left py-2 text-xs text-muted font-medium">Negara</th>
                                            <th className="text-right py-2 text-xs text-muted font-medium">Views</th>
                                            <th className="text-right py-2 text-xs text-muted font-medium">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {countryStats.slice(0, 15).map((c, i) => (
                                            <tr key={c.country} className="border-b border-border/30 last:border-0">
                                                <td className="py-1.5 text-xs text-muted">{i + 1}</td>
                                                <td className="py-1.5 font-medium text-fg">{c.country || "Unknown"}</td>
                                                <td className="py-1.5 text-right text-xs">{c._count.toLocaleString()}</td>
                                                <td className="py-1.5 text-right text-xs text-muted">
                                                    {views30d > 0 ? Math.round((c._count / views30d) * 100) : 0}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Globe size={32} className="mx-auto text-muted/30 mb-2" />
                                <p className="text-sm text-muted">Belum ada data negara</p>
                                <p className="text-xs text-muted/60 mt-1">Data negara tersedia saat deploy di Vercel/Cloudflare</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 size={14} className="text-muted" />
                            Halaman Terpopuler (30 Hari)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topPages.length > 0 ? (
                            <div className="space-y-1.5">
                                {topPages.map((page, i) => {
                                    const maxPage = topPages[0]?._count || 1;
                                    return (
                                        <div key={page.path} className="flex items-center gap-2.5 py-1">
                                            <span className="text-xs text-muted w-5 text-right shrink-0">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-fg truncate">{page.path}</span>
                                                </div>
                                                <div className="bg-border/50 rounded-full h-1.5 overflow-hidden mt-1">
                                                    <div
                                                        className="bg-accent h-full rounded-full"
                                                        style={{ width: `${(page._count / maxPage) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-fg shrink-0">{page._count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted text-center py-6">Belum ada data</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
