import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import prisma from "@/prisma";
import Link from "next/link";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioNovelsPage({
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

    const novels = await prisma.novel.findMany({
        orderBy: { createdAt: "desc" },
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
    });

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Novel Management</h1>
                <p className="text-muted">Manage all novels on the platform</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Novels ({novels.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold">Title</th>
                                    <th className="text-left py-3 px-4 font-semibold">Author</th>
                                    <th className="text-left py-3 px-4 font-semibold">Chapters</th>
                                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {novels.map((novel) => (
                                    <tr key={novel.id} className="border-b hover:bg-bg">
                                        <td className="py-3 px-4 font-medium">{novel.title}</td>
                                        <td className="py-3 px-4 text-sm">
                                            {novel.author.name || novel.author.email}
                                        </td>
                                        <td className="py-3 px-4 text-center">{novel._count.chapters}</td>
                                        <td className="py-3 px-4 text-sm">
                                            {new Date(novel.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/novel/${novel.id}`}
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
