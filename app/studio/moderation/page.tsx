import { auth } from "@/lib/auth";
import prisma from "@/prisma";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioModerationPage({
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

    // Get recent comments
    const recentComments = await prisma.comment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            chapter: {
                select: {
                    novel: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            },
        },
    });

    // Get recent ratings/reviews
    const recentReviews = await prisma.rating.findMany({
        where: {
            review: {
                not: null,
            },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            novel: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    // Get stats
    const stats = {
        totalComments: await prisma.comment.count(),
        totalRatings: await prisma.rating.count(),
        totalReviews: await prisma.rating.count({
            where: { review: { not: null } },
        }),
    };

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <div className="mb-8">
                <h1 className="text-4xl font-bold">Content Moderation</h1>
                <p className="text-muted mt-1">Manage comments and reviews</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="text-center py-6">
                        <div className="text-3xl font-bold text-accent">{stats.totalComments}</div>
                        <p className="text-sm text-muted mt-1">Total Comments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="text-center py-6">
                        <div className="text-3xl font-bold text-green-600">{stats.totalRatings}</div>
                        <p className="text-sm text-muted mt-1">Total Ratings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="text-center py-6">
                        <div className="text-3xl font-bold text-accent">{stats.totalReviews}</div>
                        <p className="text-sm text-muted mt-1">Written Reviews</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Comments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentComments.map((comment) => (
                                <div key={comment.id} className="p-4 bg-bg rounded-lg border border-border">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-fg">
                                                {comment.user.name || comment.user.email}
                                            </p>
                                            <Link
                                                href={`/novel/${comment.chapter.novel.id}`}
                                                className="text-xs text-accent hover:underline"
                                            >
                                                {comment.chapter.novel.title}
                                            </Link>
                                        </div>
                                        <span className="text-xs text-muted">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-fg line-clamp-2">{comment.content}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                                        <span>❤️ {comment.likes}</span>
                                        {comment.parentId && <span>↩ Reply</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentReviews.map((rating) => (
                                <div key={rating.id} className="p-4 bg-bg rounded-lg border border-border">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-fg">
                                                {rating.user.name || rating.user.email}
                                            </p>
                                            <Link
                                                href={`/novel/${rating.novel.id}`}
                                                className="text-xs text-accent hover:underline"
                                            >
                                                {rating.novel.title}
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="text-sm font-semibold">{rating.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-fg line-clamp-3">{rating.review}</p>
                                    <p className="text-xs text-muted mt-2">
                                        {new Date(rating.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudioLayout>
    );
}
