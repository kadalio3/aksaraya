import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import prisma from "@/prisma";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    if (params.verify !== STUDIO_ACCESS_TOKEN) {
        notFound();
    }

    // Fetch analytics data
    const [
        totalUsers,
        totalNovels,
        totalChapters,
        recentUsers,
        topAuthors,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.novel.count(),
        prisma.chapter.count(),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
            },
        }),
        prisma.user.findMany({
            where: { role: "AUTHOR" },
            take: 5,
            include: {
                _count: {
                    select: {
                        novels: true,
                    },
                },
            },
            orderBy: {
                novels: {
                    _count: "desc",
                },
            },
        }),
    ]);

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
                <p className="text-muted">Platform insights and statistics</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="bg-surface">
                    <CardContent className="p-6">
                        <div className="text-sm text-accent font-medium mb-1">Total Users</div>
                        <div className="text-3xl font-bold text-fg">{totalUsers}</div>
                        <div className="text-sm text-accent mt-2">+{recentUsers} this month</div>
                    </CardContent>
                </Card>

                <Card className="bg-surface">
                    <CardContent className="p-6">
                        <div className="text-sm text-green-600 font-medium mb-1">Total Novels</div>
                        <div className="text-3xl font-bold text-fg">{totalNovels}</div>
                        <div className="text-sm text-green-600 mt-2">Published works</div>
                    </CardContent>
                </Card>

                <Card className="bg-surface">
                    <CardContent className="p-6">
                        <div className="text-sm text-accent font-medium mb-1">Total Chapters</div>
                        <div className="text-3xl font-bold text-fg">{totalChapters}</div>
                        <div className="text-sm text-accent mt-2">Content pieces</div>
                    </CardContent>
                </Card>

                <Card className="bg-surface">
                    <CardContent className="p-6">
                        <div className="text-sm text-orange-600 font-medium mb-1">Avg Chapters/Novel</div>
                        <div className="text-3xl font-bold text-amber-600">
                            {totalNovels > 0 ? Math.round(totalChapters / totalNovels) : 0}
                        </div>
                        <div className="text-sm text-orange-600 mt-2">Platform average</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Authors */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Authors by Novels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topAuthors.map((author, index) => (
                                <div key={author.id} className="flex items-center gap-4 p-3 bg-bg rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{author.name || "Unnamed"}</p>
                                        <p className="text-sm text-muted">{author.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-accent">{author._count.novels}</p>
                                        <p className="text-xs text-muted">novels</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Chart Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Growth (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-bg rounded-lg">
                            <div className="text-center">
                                <div className="text-4xl mb-2">📈</div>
                                <p className="text-muted">Chart visualization coming soon</p>
                                <p className="text-sm text-muted mt-2">
                                    Integration with charting library required
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-bg rounded-lg">
                            <div className="text-sm text-accent font-medium">New Users (30d)</div>
                            <div className="text-2xl font-bold text-fg mt-1">{recentUsers}</div>
                        </div>
                        <div className="p-4 bg-bg rounded-lg">
                            <div className="text-sm text-green-600 font-medium">Active Authors</div>
                            <div className="text-2xl font-bold text-fg mt-1">{topAuthors.length}</div>
                        </div>
                        <div className="p-4 bg-bg rounded-lg">
                            <div className="text-sm text-accent font-medium">Platform Health</div>
                            <div className="text-2xl font-bold text-fg mt-1">Excellent</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </StudioLayout>
    );
}
