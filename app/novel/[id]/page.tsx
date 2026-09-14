import prisma from "@/prisma";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getStudioUrl } from "@/lib/studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChapterList } from "@/components/novel/chapter-list";
import { FavoriteButton } from "@/components/novel/favorite-button";
import { NovelStatusBadge } from "@/components/novel/novel-status-badge";
import { RatingSection } from "@/components/rating/rating-section";
import { RatingDisplay } from "@/components/rating/star-rating";
import { Tabs } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, Star, Info } from "lucide-react";

export default async function NovelDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            translator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            author: true,
            chapters: {
                where: session?.user?.id
                    ? undefined
                    : { isPublished: true },
                orderBy: { order: "asc" },
            },
            _count: {
                select: {
                    favorites: true,
                    chapters: true,
                },
            },
        },
    });

    if (!novel) {
        notFound();
    }

    const genres = novel.genres.split(",").map((g) => g.trim()).filter(Boolean);
    const tags = novel.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const isTranslator = session?.user?.id === novel.translatorId;

    const isFavorited = session?.user
        ? await prisma.favorite.findUnique({
            where: {
                userId_novelId: {
                    userId: session.user.id,
                    novelId: novel.id,
                },
            },
        })
        : null;

    const settings = await getSettings();

    

    return (
        <div className="min-h-screen bg-bg">
            <Navbar user={session?.user} siteName={settings.site_name} />
            <Container className="py-8">
                <div className="bg-surface rounded-xl border border-border p-6 sm:p-8">
                    {/* Novel Header */}
                    <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 mb-6">
                        {/* Cover */}
                        <div className="w-[140px] sm:w-44 md:w-56 aspect-[3/4] bg-muted/10 border border-border rounded-lg overflow-hidden flex-shrink-0">
                            {novel.coverUrl ? (
                                <Image
                                    src={novel.coverUrl}
                                    alt={novel.title}
                                    width={224}
                                    height={336}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <BookOpen size={48} className="text-muted/30 mb-2" />
                                    <span className="text-4xl font-bold font-display text-muted/40">
                                        {novel.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-fg mb-2">{novel.title}</h1>

                            {/* Status and Schedule */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {novel.status && (
                                    <NovelStatusBadge
                                        status={novel.status as "ONGOING" | "COMPLETED" | "HIATUS" | "DROPPED"}
                                        className="text-xs"
                                    />
                                )}

                                {novel.updateSchedule && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/10 text-muted rounded-md text-xs font-medium border border-border">
                                        <Calendar size={12} />
                                        {novel.updateSchedule}
                                    </span>
                                )}

                                {novel.totalChapters && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/10 text-muted rounded-md text-xs font-medium border border-border">
                                        <BookOpen size={12} />
                                        {novel._count.chapters}/{novel.totalChapters} chapters
                                    </span>
                                )}
                            </div>

                            {/* Author & Translator */}
                            <div className="text-sm mb-4 space-y-1">
                                <p className="text-muted">
                                    Author:{" "}
                                    {novel.author ? (
                                        <>
                                            <span className="font-medium text-fg">{novel.author.name}</span>
                                            {novel.author.originalLanguage && (
                                                <span className="text-xs ml-1">({novel.author.originalLanguage})</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-muted italic">Belum diisi</span>
                                    )}
                                </p>
                                <p className="text-muted">
                                    Penerjemah:{" "}
                                    <Link
                                        href={`/author/${novel.translator.id}`}
                                        className="font-medium text-accent hover:opacity-80 transition-[opacity] duration-300"
                                    >
                                        {novel.translator.name || novel.translator.email}
                                    </Link>
                                </p>
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {genres.map((genre) => (
                                    <Link
                                        key={genre}
                                        href={`/genre/${encodeURIComponent(genre)}`}
                                    >
                                        <Badge variant="primary" className="cursor-pointer hover:opacity-80">
                                            {genre}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>

                            {/* Rating Display */}
                            {(novel.totalRatings || 0) > 0 && (
                                <div className="mb-4">
                                    <RatingDisplay
                                        average={novel.averageRating || 0}
                                        total={novel.totalRatings || 0}
                                        size="md"
                                    />
                                </div>
                            )}



                            {/* Actions */}
                            <div className="flex gap-3">
                                {novel.chapters.length > 0 && (
                                    <Link href={`/novel/${novel.id}/chapter/${novel.chapters[0].id}`}>
                                        <Button variant="primary">Start Reading</Button>
                                    </Link>
                                )}
                                {isTranslator ? (
                                    <>
                                        <Link href={`/novel/${novel.id}/edit`}>
                                            <Button variant="outline">Edit Novel</Button>
                                        </Link>
                                        <Link href={`/novel/${novel.id}/chapter/new`}>
                                            <Button variant="secondary">Add Chapter</Button>
                                        </Link>
                                    </>
                                ) : (
                                    session?.user && (
                                        <FavoriteButton
                                            novelId={novel.id}
                                            initialFavorited={!!isFavorited}
                                        />
                                    )
                                )}
                            </div>

                            <p className="text-xs text-muted mt-6">
                                Last updated: {formatDate(novel.updatedAt)}
                            </p>
                        </div>
                    </div>

                    {/* Tabbed Content */}
                    <div className="border-t border-border pt-8">
                        <Tabs
                            tabs={[
                                {
                                    id: "about",
                                    label: "About",
                                    icon: <Info size={14} />,
                                },
                                {
                                    id: "chapters",
                                    label: "Chapters",
                                    icon: <BookOpen size={14} />,
                                    count: novel._count.chapters,
                                },
                                {
                                    id: "reviews",
                                    label: "Reviews",
                                    icon: <Star size={14} />,
                                    count: novel.totalRatings || 0,
                                },
                            ]}
                        >
                            {/* About Tab */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-fg mb-2">Synopsis</h3>
                                    <p className="text-fg leading-relaxed text-sm whitespace-pre-line">
                                        {novel.description}
                                    </p>
                                </div>
                                {tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-fg mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tags.map((tag) => (
                                                <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                                                    <Badge variant="default" size="sm" className="cursor-pointer hover:opacity-80">
                                                        #{tag}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ChapterList
                                chapters={novel.chapters}
                                novelId={novel.id}
                                isAuthor={isTranslator}
                            />

                            <RatingSection
                                novelId={novel.id}
                                currentUserId={session?.user?.id}
                                initialAverage={novel.averageRating || 0}
                                initialTotal={novel.totalRatings || 0}
                            />
                        </Tabs>
                    </div>
                </div>
            </Container>
        <Footer siteName={settings.site_name} />
        </div>
    );
}
