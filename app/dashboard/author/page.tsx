import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import prisma from "@/prisma";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AuthorDashboardPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    if (session.user.role !== "TRANSLATOR" && session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Get author's novels with chapter counts
    const novels = await prisma.novel.findMany({
        where: { translatorId: session.user.id },
        include: {
            _count: {
                select: {
                    chapters: true,
                    favorites: true,
                },
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    // Get favorites trend data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const favoritesTrend = await prisma.favorite.findMany({
        where: {
            novel: {
                translatorId: session.user.id,
            },
            createdAt: {
                gte: sixMonthsAgo,
            },
        },
        select: {
            createdAt: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    // Calculate statistics
    const totalNovels = novels.length;
    const totalChapters = novels.reduce((sum, novel) => sum + novel._count.chapters, 0);
    const totalFavorites = novels.reduce((sum, novel) => sum + novel._count.favorites, 0);

    const settings = await getSettings();

    

    return (
        <div className="min-h-screen bg-bg">
            <Navbar user={session.user} siteName={settings.site_name} />
            <Container className="py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Dashboard Penerjemah</h1>
                    <Link href="/novel/new">
                        <Button variant="primary">Create New Novel</Button>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="text-center py-6">
                            <div className="text-4xl font-bold text-accent">{totalNovels}</div>
                            <p className="text-muted mt-2">Total Novels</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="text-center py-6">
                            <div className="text-4xl font-bold text-green-600">{totalChapters}</div>
                            <p className="text-muted mt-2">Total Chapters</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="text-center py-6">
                            <div className="text-4xl font-bold text-purple-600">{totalFavorites}</div>
                            <p className="text-muted mt-2">Total Favorites</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Novels List */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Novels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {novels.length > 0 ? (
                            <div className="space-y-4">
                                {novels.map((novel) => (
                                    <div
                                        key={novel.id}
                                        className="p-4 border border-border rounded-lg hover:shadow-sm transition"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Link href={`/novel/${novel.id}`} className="hover:text-accent">
                                                    <h3 className="font-semibold text-lg">{novel.title}</h3>
                                                </Link>
                                                <p className="text-sm text-muted mt-1 line-clamp-2">
                                                    {novel.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                                                    <span>{novel._count.chapters} chapters</span>
                                                    <span>{novel._count.favorites} favorites</span>
                                                    <span>Updated {new Date(novel.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-4">
                                                <Link href={`/novel/${novel.id}/edit`}>
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                </Link>
                                                <Link href={`/novel/${novel.id}/chapter/new`}>
                                                    <Button variant="primary" size="sm">New Chapter</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted mb-4">You haven't created any novels yet</p>
                                <Link href="/novel/new">
                                    <Button>Create Your First Novel</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Analytics Dashboard */}
                {novels.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">Analytics & Insights</h2>
                        <AnalyticsDashboard novels={novels} favoritesTrend={favoritesTrend} />
                    </div>
                )}
            </Container>
        <Footer siteName={settings.site_name} />
        </div>
    );
}
