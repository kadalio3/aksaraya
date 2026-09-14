import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import prisma from "@/prisma";

export default async function StudioCategoriesPage() {
    // Get all novels with genres
    const novels = await prisma.novel.findMany({
        select: {
            genres: true,
        },
    });

    // Extract and count unique genres
    const genreCounts: { [key: string]: number } = {};

    novels.forEach((novel) => {
        const genres = novel.genres
            .split(',')
            .map(g => g.trim())
            .filter(g => g.length > 0);

        genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
    });

    // Convert to array and sort by count
    const genreStats = Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const totalGenres = genreStats.length;
    const totalNovels = novels.length;
    const maxCount = genreStats[0]?.count || 1;

    return (
        <>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Genre Management</h1>
                <p className="text-muted">Manage novel genres used across the platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="text-center py-6">
                        <div className="text-3xl font-bold text-accent">{totalGenres}</div>
                        <p className="text-sm text-muted mt-1">Unique Genres</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="text-center py-6">
                        <div className="text-3xl font-bold text-accent">{totalNovels}</div>
                        <p className="text-sm text-muted mt-1">Total Novels</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="text-center py-6">
                        <div className="text-3xl font-bold text-green-600">
                            {genreStats[0]?.name || "N/A"}
                        </div>
                        <p className="text-sm text-muted mt-1">Most Popular</p>
                    </CardContent>
                </Card>
            </div>

            {/* Genre Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Genre Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    {genreStats.length > 0 ? (
                        <div className="space-y-3">
                            {genreStats.map((genre) => (
                                <div key={genre.name} className="flex items-center gap-4">
                                    <div className="w-32 font-medium truncate">{genre.name}</div>
                                    <div className="flex-1 bg-border rounded-full h-6 overflow-hidden">
                                        <div
                                            className="bg-accent h-full rounded-full flex items-center justify-end px-2"
                                            style={{ width: `${(genre.count / maxCount) * 100}%` }}
                                        >
                                            <span className="text-xs text-white font-medium">
                                                {genre.count > 5 ? genre.count : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-16 text-right text-sm text-muted">
                                        {genre.count} novel{genre.count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted">
                            <p>No genres found. Novels need to have genres assigned.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Genres Grid */}
            {genreStats.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Top Genres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {genreStats.slice(0, 10).map((genre) => (
                            <Card key={genre.name} className="hover:bg-bg transition-[background-color] duration-300">
                                <CardContent className="p-4 text-center">
                                    <div className="text-3xl mb-2">📚</div>
                                    <h3 className="font-semibold text-sm mb-1 truncate">{genre.name}</h3>
                                    <p className="text-xs text-muted">{genre.count} novels</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
