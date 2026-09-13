import prisma from "@/prisma";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getStudioUrl } from "@/lib/studio";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { NovelListCard } from "@/components/novel/novel-list-card";
import Link from "next/link";
import { Search, BookOpen, User } from "lucide-react";
import Image from "next/image";

interface SearchParams {
    q?: string;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const session = await auth();
    const studioUrl = await getStudioUrl();
    const settings = await getSettings();
    const params = await searchParams;
    const query = params.q?.trim() || "";

    const novelSelect = {
        id: true, title: true, description: true, genres: true, coverUrl: true,
        status: true, updateSchedule: true, totalChapters: true,
        averageRating: true, totalRatings: true,
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { chapters: true } },
    } as const;

    const [novels, authors] = await Promise.all([
        query
            ? prisma.novel.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { description: { contains: query } },
                        { tags: { contains: query } },
                        { genres: { contains: query } },
                    ],
                },
                take: 20,
                orderBy: { views: "desc" },
                select: novelSelect,
            })
            : [],
        query
            ? prisma.user.findMany({
                where: {
                    role: { in: ["AUTHOR", "ADMIN"] },
                    OR: [
                        { name: { contains: query } },
                        { email: { contains: query } },
                    ],
                },
                take: 8,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    _count: { select: { novels: true } },
                },
            })
            : [],
    ]);

    const totalResults = novels.length + authors.length;

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <Navbar user={session?.user} studioUrl={studioUrl} siteName={settings.site_name} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
                {/* Search Header */}
                <div className="mb-8">
                    <form method="get" action="/search">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="Cari novel, penulis, genre, tag..."
                                autoFocus
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-surface text-fg text-base focus:border-accent focus:outline-none transition-[border-color] duration-300 shadow-sm"
                            />
                        </div>
                    </form>

                    {query && (
                        <p className="mt-3 text-sm text-muted">
                            {totalResults > 0
                                ? `Ditemukan ${totalResults} hasil untuk "${query}"`
                                : `Tidak ada hasil untuk "${query}"`}
                        </p>
                    )}
                </div>

                {!query ? (
                    <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-muted/30 mb-4" />
                        <p className="text-muted text-lg font-medium">Cari novel atau penulis favorit kamu</p>
                        <p className="text-muted text-sm mt-1">Ketik judul, nama penulis, genre, atau tag</p>
                    </div>
                ) : totalResults === 0 ? (
                    <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-muted/30 mb-4" />
                        <p className="text-muted text-lg font-medium">Hasil tidak ditemukan</p>
                        <p className="text-muted text-sm mt-1">Coba kata kunci yang berbeda</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Authors Section */}
                        {authors.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <User size={16} className="text-muted" />
                                    <h2 className="text-sm font-semibold text-fg uppercase tracking-wide">
                                        Penulis ({authors.length})
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {authors.map((author) => (
                                        <Link
                                            key={author.id}
                                            href={`/author/${author.id}`}
                                            className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:border-accent/40 transition-[border-color] duration-300"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-bold shrink-0">
                                                {(author.name?.charAt(0) || author.email.charAt(0)).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-fg text-sm truncate">
                                                    {author.name || "Anonymous"}
                                                </p>
                                                <p className="text-xs text-muted truncate">{author.email}</p>
                                                <p className="text-xs text-muted mt-0.5">
                                                    {author._count.novels} novel
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Novels Section */}
                        {novels.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen size={16} className="text-muted" />
                                    <h2 className="text-sm font-semibold text-fg uppercase tracking-wide">
                                        Novel ({novels.length})
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {novels.map((novel) => (
                                        <NovelListCard key={novel.id} novel={novel} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            <Footer siteName={settings.site_name} />
        </div>
    );
}
