import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import prisma from "@/prisma";

export default async function StudioTagsPage() {
    // Get all novels with tags
    const novels = await prisma.novel.findMany({
        select: {
            tags: true,
        },
    });

    // Extract and count unique tags
    const tagCounts: { [key: string]: number } = {};

    novels.forEach((novel) => {
        const tags = novel.tags
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);

        tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    // Convert to array and sort by count
    const tagStats = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const totalTags = tagStats.length;
    const totalUses = tagStats.reduce((sum, tag) => sum + tag.count, 0);

    return (
        <>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Tag Management</h1>
                <p className="text-muted">Manage and moderate novel tags used across the platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-accent">{totalTags}</div>
                        <p className="text-sm text-muted mt-1">Unique Tags</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-accent">{totalUses}</div>
                        <p className="text-sm text-muted mt-1">Total Uses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-green-600">
                            {tagStats[0]?.name || "N/A"}
                        </div>
                        <p className="text-sm text-muted mt-1">Most Popular</p>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Tags Cloud */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    {tagStats.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {tagStats.slice(0, 30).map((tag) => {
                                // Size based on usage
                                const fontSize = tag.count > 10 ? 'text-xl' : tag.count > 5 ? 'text-lg' : 'text-base';
                                return (
                                    <div
                                        key={tag.name}
                                        className={`inline-flex items-center gap-2 px-4 py-2 bg-bg rounded-full border border-border hover:shadow-sm transition-shadow ${fontSize}`}
                                    >
                                        <span className="font-medium">#{tag.name}</span>
                                        <span className="text-sm text-muted bg-surface px-2 py-0.5 rounded-full">
                                            {tag.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted">
                            <p>No tags found. Novels need to have tags assigned.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tag Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    {tagStats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold">Rank</th>
                                        <th className="text-left py-3 px-4 font-semibold">Tag</th>
                                        <th className="text-left py-3 px-4 font-semibold">Usage Count</th>
                                        <th className="text-right py-3 px-4 font-semibold">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tagStats.map((tag, index) => (
                                        <tr key={tag.name} className="border-b hover:bg-bg">
                                            <td className="py-3 px-4 text-muted">#{index + 1}</td>
                                            <td className="py-3 px-4 font-medium">
                                                <span className="px-2 py-1 bg-accent/10 text-blue-800 rounded text-sm">
                                                    {tag.name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{tag.count} novels</td>
                                            <td className="py-3 px-4 text-right text-muted">
                                                {((tag.count / totalUses) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted">
                            <p>No tags to display.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
