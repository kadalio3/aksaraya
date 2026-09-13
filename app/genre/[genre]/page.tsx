import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/container";
import prisma from "@/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NovelCard } from "@/components/novel/novel-card";

export default async function GenrePage({
    params,
}: {
    params: Promise<{ genre: string }>;
}) {
    const { genre } = await params;

    // Decode genre from URL
    const decodedGenre = decodeURIComponent(genre);

    // Fetch novels with this genre
    const novels = await prisma.novel.findMany({
        where: {
            genres: {
                contains: decodedGenre,
            },
        },
        select: {
            id: true,
            title: true,
            description: true,
            genres: true,
            coverUrl: true,
            status: true,
            updateSchedule: true,
            totalChapters: true,
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
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const settings = await getSettings();

    

    return (
        <div className="min-h-screen bg-bg">
            <Navbar siteName={settings.site_name} />
            <Container className="py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-fg mb-2">
                        Genre: {decodedGenre}
                    </h1>
                    <p className="text-muted">
                        {novels.length} {novels.length === 1 ? "novel" : "novels"} found
                    </p>
                </div>

                {/* Novels Grid */}
                {novels.length === 0 ? (
                    <div className="bg-surface rounded-xl shadow-sm p-12 text-center">
                        <p className="text-muted">No novels found in this genre.</p>
                        <Link href="/novel" className="text-accent hover:underline mt-4 inline-block">
                            ← Browse all novels
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
                        {novels.map((novel) => (
                            <NovelCard key={novel.id} novel={novel} />
                        ))}
                    </div>
                )}
            </Container>
        <Footer siteName={settings.site_name} />
        </div>
    );
}
