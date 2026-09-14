import prisma from "@/prisma";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ChapterReaderNav } from "@/components/novel/chapter-reader-nav";
import { CommentSection } from "@/components/comment/comment-section";
import { BookmarkButton } from "@/components/novel/bookmark-button";
import { ViewTracker } from "@/components/novel/view-tracker";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, AlignLeft } from "lucide-react";

function estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function countWords(content: string): number {
    return content.trim().split(/\s+/).filter(Boolean).length;
}

export default async function ChapterReadingPage({
    params,
}: {
    params: Promise<{ id: string; chapterId: string }>;
}) {
    const { id, chapterId } = await params;
    const session = await auth();

    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            novel: {
                include: {
                    translator: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    if (!chapter) {
        notFound();
    }

    // Check if user has permission to view unpublished chapter
    if (!chapter.isPublished) {
        if (!session?.user || (session.user.id !== chapter.novel.translatorId && session.user.role !== "ADMIN")) {
            redirect(`/novel/${id}`);
        }
    }

    // Get all chapters for navigation
    const allChapters = await prisma.chapter.findMany({
        where: {
            novelId: id,
            isPublished: session?.user?.id === chapter.novel.translatorId ? undefined : true,
        },
        select: {
            id: true,
            order: true,
            title: true,
        },
        orderBy: { order: "asc" },
    });

    const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

    const readingTime = estimateReadingTime(chapter.content);
    const wordCount = chapter.wordCount || countWords(chapter.content);

    // Check if user has bookmarked this chapter
    const isBookmarked = session?.user
        ? !!(await prisma.bookmark.findUnique({
            where: {
                userId_chapterId: {
                    userId: session.user.id,
                    chapterId: chapter.id,
                },
            },
        }))
        : false;

    // Save reading progress (if authenticated)
    if (session?.user) {
        await prisma.readingProgress.upsert({
            where: {
                userId_novelId: {
                    userId: session.user.id,
                    novelId: id,
                },
            },
            create: {
                userId: session.user.id,
                novelId: id,
                chapterId: chapter.id,
                progress: 0,
                lastReadAt: new Date(),
            },
            update: {
                chapterId: chapter.id,
                lastReadAt: new Date(),
            },
        });
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* View tracker — fires view increment via cookie-gated API */}
            <ViewTracker chapterId={chapter.id} novelId={id} />

            {/* Enhanced Navigation */}
            <ChapterReaderNav
                novelId={id}
                novelTitle={chapter.novel.title}
                currentChapter={{
                    id: chapter.id,
                    order: chapter.order,
                    title: chapter.title,
                }}
                allChapters={allChapters}
                prevChapter={prevChapter}
                nextChapter={nextChapter}
                readingTime={readingTime}
                userId={session?.user?.id}
                novelId2={id}
                chapterId={chapterId}
            />

            {/* Content */}
            <Container size="lg" className="py-6 sm:py-8">
                <article className="reading-content">
                    <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border">
                        <p className="text-xs sm:text-sm text-muted mb-1.5 sm:mb-2">Chapter {chapter.order}</p>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-fg mb-3 sm:mb-4">
                            {chapter.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs sm:text-sm text-muted">

                                <span className="flex items-center gap-1.5">
                                    <Clock size={13} />
                                    {readingTime} mnt baca
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <AlignLeft size={13} />
                                    {wordCount.toLocaleString()} kata
                                </span>
                                <span>{formatDate(chapter.publishedAt || chapter.createdAt)}</span>
                            </div>

                            {/* Bookmark button */}
                            {session?.user && (
                                <BookmarkButton
                                    chapterId={chapter.id}
                                    novelId={id}
                                    initialBookmarked={isBookmarked}
                                />
                            )}
                        </div>

                        {!chapter.isPublished && (
                            <div className="mt-4 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                                    📝 Chapter ini masih dalam mode draft
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Chapter Content */}
                    <MarkdownRenderer content={chapter.content} />
                </article>
            </Container>

            {/* Bottom Navigation */}
            <div className="border-t border-border bg-bg">
                <Container size="lg" className="py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        {prevChapter ? (
                            <Link href={`/novel/${id}/chapter/${prevChapter.id}`}>
                                <Button variant="outline">
                                    <span className="hidden sm:inline">← Chapter Sebelumnya</span>
                                    <span className="sm:hidden">← Sebelumnya</span>
                                </Button>
                            </Link>
                        ) : (
                            <div />
                        )}
                        <Link href={`/novel/${id}`}>
                            <Button variant="ghost" className="p-1.5 sm:p-2" title="Kembali ke Novel">
                                <svg className="w-7 h-7 sm:w-10 sm:h-10 stroke-accent" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </Button>
                        </Link>
                        {nextChapter ? (
                            <Link href={`/novel/${id}/chapter/${nextChapter.id}`}>
                                <Button variant="primary">
                                    <span className="hidden sm:inline">Chapter Berikutnya →</span>
                                    <span className="sm:hidden">Berikutnya →</span>
                                </Button>
                            </Link>
                        ) : (
                            <Link href={`/novel/${id}`}>
                                <Button variant="outline">Kembali ke Novel</Button>
                            </Link>
                        )}
                    </div>
                </Container>
            </div>

            {/* Comments Section */}
            <div className="border-t border-border bg-bg">
                <Container size="lg" className="py-6 sm:py-10">
                    <CommentSection
                        chapterId={chapter.id}
                        currentUserId={session?.user?.id}
                    />
                </Container>
            </div>
        </div>
    );
}
