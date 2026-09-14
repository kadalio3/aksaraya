import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import prisma from "@/prisma";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContinueReading } from "@/components/dashboard/continue-reading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { getStudioUrl } from "@/lib/studio";
import { Bookmark, BookOpen } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    const studioUrl = await getStudioUrl();

    // Get user's favorites
    const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
            novel: {
                include: {
                    translator: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            chapters: true,
                        },
                    },
                },
            },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
    });

    // Get reading progress - latest 20 for continue reading display
    const readingProgress = await prisma.readingProgress.findMany({
        where: { userId: session.user.id },
        select: {
            progress: true,
            lastReadAt: true,
            novel: {
                select: {
                    id: true,
                    title: true,
                    coverUrl: true,
                    status: true,
                    translator: {
                        select: { name: true },
                    },
                    _count: {
                        select: { chapters: true },
                    },
                },
            },
            chapter: {
                select: {
                    id: true,
                    title: true,
                    order: true,
                },
            },
        },
        take: 20,
        orderBy: { lastReadAt: "desc" },
    });

    // Get user's bookmarks
    const bookmarks = await prisma.bookmark.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
            chapter: {
                select: {
                    id: true,
                    title: true,
                    order: true,
                },
            },
            novel: {
                select: {
                    id: true,
                    title: true,
                    coverUrl: true,
                },
            },
        },
    });

    const settings = await getSettings();

    return (
        <div className="min-h-screen bg-bg">
            <Navbar user={session.user} studioUrl={studioUrl} siteName={settings.site_name} />
            <Container className="py-8">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                {/* Continue Reading - Full Width, Best Option */}
                <div className="mb-8">
                    <ContinueReading readingProgress={readingProgress} />
                </div>

                {/* Favorites */}
                <Card>
                    <CardHeader>
                        <CardTitle>Novel Favorit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {favorites.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {favorites.map((fav) => (
                                    <Link
                                        key={fav.id}
                                        href={`/novel/${fav.novelId}`}
                                        className="block p-4 bg-bg rounded-lg hover:bg-bg transition border border-border"
                                    >
                                        <h3 className="font-semibold text-sm line-clamp-2">{fav.novel.title}</h3>
                                        <p className="text-xs text-muted mt-1 line-clamp-2">
                                            {fav.novel.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-muted">
                                                {fav.novel.translator.name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-muted">{fav.novel._count.chapters} ch</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted text-sm mb-3">Belum ada novel favorit</p>
                                <Link href="/novel">
                                    <Button variant="outline" size="sm">Jelajahi Novel</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bookmarks */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bookmark size={18} />
                            Bookmarks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookmarks.length > 0 ? (
                            <div className="space-y-2">
                                {bookmarks.map((bm) => (
                                    <Link
                                        key={bm.id}
                                        href={`/novel/${bm.novel.id}/chapter/${bm.chapter.id}`}
                                        className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border hover:border-accent/40 transition-[border-color] duration-300"
                                    >
                                        <BookOpen size={14} className="text-amber-500 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-fg truncate">
                                                Ch. {bm.chapter.order}: {bm.chapter.title}
                                            </p>
                                            <p className="text-xs text-muted truncate">
                                                {bm.novel.title}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Bookmark size={32} className="mx-auto text-muted/30 mb-2" />
                                <p className="text-muted text-sm">Belum ada bookmark</p>
                                <p className="text-muted text-xs mt-1">Bookmark chapter saat membaca untuk menemukannya di sini</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="mt-8 flex gap-4">
                    <Link href="/novel">
                        <Button variant="primary">Jelajahi Novel</Button>
                    </Link>
                    {(session.user.role === "TRANSLATOR" || session.user.role === "ADMIN") && (
                        <Link href="/dashboard/author">
                            <Button variant="secondary">Novel Saya</Button>
                        </Link>
                    )}
                </div>
            </Container>
            <Footer siteName={settings.site_name} />
        </div>
    );
}
