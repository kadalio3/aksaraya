import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { getSettings } from "@/lib/settings";
import { getStudioUrl } from "@/lib/studio";
import { Container } from "@/components/ui/container";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NovelCard } from "@/components/novel/novel-card";
import { FollowButton } from "@/components/author/follow-button";
import { Users, BookOpen, Heart } from "lucide-react";

export default async function AuthorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    // Fetch author with all published novels
    const [author, followersCount] = await Promise.all([
        prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                novels: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        coverUrl: true,
                        genres: true,
                        status: true,
                        updateSchedule: true,
                        totalChapters: true,
                        averageRating: true,
                        totalRatings: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                chapters: true,
                                favorites: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        }),
        prisma.follow.count({ where: { followingId: id } }),
    ]);

    if (!author) {
        notFound();
    }

    // Calculate total stats
    const totalChapters = author.novels.reduce(
        (sum: number, novel: any) => sum + novel._count.chapters,
        0
    );
    const totalFavorites = author.novels.reduce(
        (sum: number, novel: any) => sum + novel._count.favorites,
        0
    );

    const isOwnProfile = session?.user?.id === author.id;
    const settings = await getSettings();
    const studioUrl = await getStudioUrl();

    const stats = [
        { label: "Novel", value: author.novels.length, icon: BookOpen },
        { label: "Chapter", value: totalChapters, icon: BookOpen },
        { label: "Pengikut", value: followersCount, icon: Users },
        { label: "Favorit", value: totalFavorites, icon: Heart },
    ];

    return (
        <div className="min-h-screen bg-bg">
            <Navbar user={session?.user} studioUrl={studioUrl} siteName={settings.site_name} />
            <Container className="py-8">
                {/* Author Header */}
                <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent/10 text-accent flex items-center justify-center text-3xl sm:text-4xl font-bold shrink-0">
                            {(author.name?.charAt(0) || author.email.charAt(0)).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                <h1 className="text-2xl sm:text-3xl font-bold font-display text-fg">
                                    {author.name || "Anonymous Author"}
                                </h1>
                                {/* Follow button — hide on own profile */}
                                {session?.user && !isOwnProfile && (
                                    <FollowButton
                                        authorId={author.id}
                                        initialCount={followersCount}
                                        showCount={false}
                                    />
                                )}
                            </div>

                            <p className="text-sm text-muted mb-4">
                                Bergabung {new Date(author.createdAt).toLocaleDateString("id-ID", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="bg-bg rounded-lg px-4 py-3 text-center border border-border"
                                    >
                                        <p className="text-xl font-bold text-fg">{stat.value.toLocaleString()}</p>
                                        <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Novels */}
                <div>
                    <h2 className="text-xl font-bold font-display text-fg mb-5">
                        Novel oleh {author.name || "penulis ini"}
                    </h2>

                    {author.novels.length === 0 ? (
                        <div className="bg-surface rounded-xl border border-border p-12 text-center">
                            <BookOpen size={40} className="mx-auto text-muted/30 mb-3" />
                            <p className="text-muted">Belum ada novel yang dipublish.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {author.novels.map((novel: any) => (
                                <NovelCard key={novel.id} novel={novel} />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
            <Footer siteName={settings.site_name} />
        </div>
    );
}
