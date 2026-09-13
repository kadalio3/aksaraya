import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ContentTabs } from "@/components/studio/content-tabs";
import prisma from "@/prisma";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioContentPage({
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

    // Fetch novels and chapters
    const [novels, chapters] = await Promise.all([
        prisma.novel.findMany({
            include: {
                author: {
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
            orderBy: { createdAt: "desc" },
            take: 50,
        }),
        prisma.chapter.findMany({
            include: {
                novel: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),
    ]);

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Content Management</h1>
                <p className="text-muted">Manage novels and chapters across the platform</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-surface rounded-xl p-6 border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-accent font-medium mb-1">Total Novels</p>
                            <p className="text-4xl font-bold text-fg">{novels.length}</p>
                        </div>
                        <div className="text-5xl">📚</div>
                    </div>
                </div>

                <div className="bg-surface rounded-xl p-6 border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-accent font-medium mb-1">Total Chapters</p>
                            <p className="text-4xl font-bold text-fg">{chapters.length}</p>
                        </div>
                        <div className="text-5xl">📖</div>
                    </div>
                </div>
            </div>

            {/* Tabbed Content */}
            <ContentTabs novels={novels} chapters={chapters} studioToken={params.verify} />
        </StudioLayout>
    );
}
