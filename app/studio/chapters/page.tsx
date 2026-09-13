import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import prisma from "@/prisma";
import Link from "next/link";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioChaptersPage({
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

    const chapters = await prisma.chapter.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
            novel: {
                select: {
                    title: true,
                    id: true,
                },
            },
        },
    });

    const totalChapters = await prisma.chapter.count();
    const publishedChapters = await prisma.chapter.count({ where: { isPublished: true } });

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Chapter Management</h1>
                <p className="text-muted">Manage all chapters across the platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-accent">{totalChapters}</div>
                        <p className="text-sm text-muted mt-1">Total Chapters</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-green-600">{publishedChapters}</div>
                        <p className="text-sm text-muted mt-1">Published</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-yellow-600">{totalChapters - publishedChapters}</div>
                        <p className="text-sm text-muted mt-1">Drafts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chapters List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Chapters (showing 100)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold">Title</th>
                                    <th className="text-left py-3 px-4 font-semibold">Novel</th>
                                    <th className="text-left py-3 px-4 font-semibold">Order</th>
                                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chapters.map((chapter) => (
                                    <tr key={chapter.id} className="border-b hover:bg-bg">
                                        <td className="py-3 px-4 font-medium">{chapter.title}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <Link
                                                href={`/novel/${chapter.novel.id}`}
                                                className="text-accent hover:underline"
                                            >
                                                {chapter.novel.title}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-center">{chapter.order}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full font-medium ${chapter.isPublished
                                                    ? "bg-green-100 text-fg"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {chapter.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {new Date(chapter.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/novel/${chapter.novel.id}/chapter/${chapter.id}`}
                                                className="text-sm text-accent hover:underline mr-3"
                                            >
                                                View
                                            </Link>
                                            <button className="text-sm text-red-600 hover:underline">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </StudioLayout>
    );
}
