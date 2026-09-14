import prisma from "@/prisma";
import { auth } from "@/lib/auth";
import { getStudioUrl } from "@/lib/studio";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { NovelListCard } from "@/components/novel/novel-list-card";
import { GenreDropdown } from "@/components/novel/genre-dropdown";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SearchParams {
    query?: string;
    genre?: string;
    sort?: string;
    status?: string;
    page?: string;
}

const STATUSES = [
    { label: "Any", value: "" },
    { label: "Ongoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Hiatus", value: "HIATUS" },
];

const SORT_OPTIONS = [
    { label: "Name", value: "title" },
    { label: "Popular", value: "popular" },
    { label: "Chapters", value: "chapters" },
    { label: "New", value: "latest" },
    { label: "Rating", value: "rating" },
    { label: "Trending", value: "trending" },
];

const GENRES = [
    "Fantasy", "Romance", "Action", "Mystery", "Sci-Fi",
    "Horror", "Comedy", "Drama", "Adventure", "Thriller",
];

export default async function NovelsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const session = await auth();
    const studioUrl = await getStudioUrl();
    const settings = await getSettings();
    const params = await searchParams;

    const page = parseInt(params.page || "1");
    const query = params.query || "";
    const genre = params.genre || "";
    const sort = params.sort || "latest";
    const status = params.status || "";
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
        where.OR = [
            { title: { contains: query } },
            { description: { contains: query } },
            { tags: { contains: query } },
        ];
    }
    if (genre) {
        where.genres = { contains: genre };
    }
    if (status) {
        where.status = status;
    }

    let orderBy: any = { updatedAt: "desc" };
    if (sort === "popular" || sort === "trending") {
        orderBy = { chapters: { _count: "desc" } };
    } else if (sort === "latest") {
        orderBy = { createdAt: "desc" };
    } else if (sort === "title") {
        orderBy = { title: "asc" };
    } else if (sort === "chapters") {
        orderBy = { totalChapters: "desc" };
    } else if (sort === "rating") {
        orderBy = { averageRating: "desc" };
    }

    const [novels, total] = await Promise.all([
        prisma.novel.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true, title: true, description: true, genres: true, coverUrl: true,
                status: true, updateSchedule: true, totalChapters: true,
                averageRating: true, totalRatings: true,
                author: { select: { id: true, name: true } },
                translator: { select: { id: true, name: true, email: true } },
                _count: { select: { chapters: true } },
            },
            orderBy,
        }),
        prisma.novel.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    function buildUrl(overrides: Record<string, string>) {
        const p = { query, genre, sort, status, page: "1", ...overrides };
        const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
        return `/novel${qs ? `?${qs}` : ""}`;
    }

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <Navbar user={session?.user} studioUrl={studioUrl} siteName={settings.site_name} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
                {/* Filters */}
                <div className="space-y-5 mb-8">
                    {/* Status */}
                    <div>
                        <h3 className="text-sm font-semibold text-fg mb-2">Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {STATUSES.map((s) => (
                                <Link
                                    key={s.value}
                                    href={buildUrl({ status: s.value })}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-[background-color,color] duration-300 ${status === s.value
                                        ? "bg-accent text-accent-fg font-medium"
                                        : "text-fg hover:bg-surface"
                                        }`}
                                >
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <h3 className="text-sm font-semibold text-fg mb-2">Sort By</h3>
                        <div className="flex flex-wrap gap-2">
                            {SORT_OPTIONS.map((s) => (
                                <Link
                                    key={s.value}
                                    href={buildUrl({ sort: s.value })}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-[background-color,color] duration-300 ${sort === s.value
                                        ? "bg-accent text-accent-fg font-medium"
                                        : "text-fg hover:bg-surface"
                                        }`}
                                >
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Genres */}
                    <div>
                        <h3 className="text-sm font-semibold text-fg mb-2">Genres</h3>
                        <GenreDropdown
                            currentGenre={genre}
                            genres={GENRES}
                            query={query}
                            sort={sort}
                            status={status}
                        />
                    </div>
                </div>

                <div className="border-t border-border pt-6">
                    {/* Results header */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-muted">
                            {total} {total === 1 ? "novel" : "novels"} found
                        </span>
                        {(query || genre || status || sort !== "latest") && (
                            <Link href="/novel" className="text-sm text-accent hover:opacity-80 font-medium transition-[opacity] duration-300">
                                Clear filters
                            </Link>
                        )}
                    </div>

                    {/* Novels Grid - 2 columns */}
                    {novels.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {novels.map((novel) => (
                                    <NovelListCard key={novel.id} novel={novel} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-10">
                                    {page > 1 && (
                                        <Link
                                            href={buildUrl({ page: String(page - 1) })}
                                            className="px-3 py-2 rounded-lg border border-border text-sm text-fg hover:bg-surface transition-[background-color] duration-300 flex items-center gap-1"
                                        >
                                            <ArrowLeft size={14} /> Prev
                                        </Link>
                                    )}

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (page <= 3) pageNum = i + 1;
                                            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = page - 2 + i;

                                            return (
                                                <Link
                                                    key={pageNum}
                                                    href={buildUrl({ page: String(pageNum) })}
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-[background-color,color] duration-300 ${page === pageNum
                                                        ? "bg-accent text-accent-fg"
                                                        : "border border-border text-fg hover:bg-surface"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {page < totalPages && (
                                        <Link
                                            href={buildUrl({ page: String(page + 1) })}
                                            className="px-3 py-2 rounded-lg border border-border text-sm text-fg hover:bg-surface transition-[background-color] duration-300 flex items-center gap-1"
                                        >
                                            Next <ArrowRight size={14} />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-muted text-lg font-medium">No novels found</p>
                            <p className="text-muted text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer siteName={settings.site_name} />
        </div>
    );
}
