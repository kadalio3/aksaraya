"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AnalyticsData {
    novels: Array<{
        id: string;
        title: string;
        _count: {
            chapters: number;
            favorites: number;
        };
        averageRating?: number | null;
        totalRatings?: number;
    }>;
    favoritesTrend: Array<{
        createdAt: Date;
    }>;
}

export function AnalyticsDashboard({ novels, favoritesTrend }: AnalyticsData) {
    // Prepare data for charts
    const novelPerformanceData = novels.map((novel) => ({
        name: novel.title.length > 20 ? novel.title.substring(0, 20) + "..." : novel.title,
        chapters: novel._count.chapters,
        favorites: novel._count.favorites,
        ratings: novel.totalRatings || 0,
        avgRating: novel.averageRating || 0,
    }));

    // Calculate totals
    const totalChapters = novels.reduce((sum, n) => sum + n._count.chapters, 0);
    const totalFavorites = novels.reduce((sum, n) => sum + n._count.favorites, 0);
    const totalRatings = novels.reduce((sum, n) => sum + (n.totalRatings || 0), 0);
    const avgOverallRating = novels.length > 0
        ? novels.reduce((sum, n) => sum + (n.averageRating || 0), 0) / novels.length
        : 0;

    // Process favorites trend data - aggregate by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: { [key: string]: number } = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        monthlyData[key] = 0;
    }

    // Aggregate favorites by month
    favoritesTrend.forEach((fav) => {
        const date = new Date(fav.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        if (monthlyData[key] !== undefined) {
            monthlyData[key]++;
        }
    });

    // Convert to chart data format
    const trendData = Object.entries(monthlyData).map(([month, favorites]) => ({
        month,
        favorites,
    }));

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface border border-border text-fg rounded-xl p-6 shadow-sm">
                    <div className="text-sm opacity-90 mb-1">Total Novels</div>
                    <div className="text-4xl font-bold">{novels.length}</div>
                    <div className="text-xs opacity-75 mt-2">Your published works</div>
                </div>

                <div className="bg-surface border border-border text-fg rounded-xl p-6 shadow-sm">
                    <div className="text-sm opacity-90 mb-1">Total Chapters</div>
                    <div className="text-4xl font-bold">{totalChapters}</div>
                    <div className="text-xs opacity-75 mt-2">Written content</div>
                </div>

                <div className="bg-surface border border-border text-fg rounded-xl p-6 shadow-sm">
                    <div className="text-sm opacity-90 mb-1">Total Favorites</div>
                    <div className="text-4xl font-bold">{totalFavorites}</div>
                    <div className="text-xs opacity-75 mt-2">Reader engagement</div>
                </div>

                <div className="bg-surface border border-border text-fg rounded-xl p-6 shadow-sm">
                    <div className="text-sm opacity-90 mb-1">Avg Rating</div>
                    <div className="text-4xl font-bold">{avgOverallRating.toFixed(1)}</div>
                    <div className="text-xs opacity-75 mt-2">⭐ from {totalRatings} reviews</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Novel Performance */}
                <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
                    <h3 className="text-lg font-bold mb-4 text-fg">Novel Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={novelPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="chapters" fill="#3b82f6" name="Chapters" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="favorites" fill="#10b981" name="Favorites" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Favorites Growth */}
                <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
                    <h3 className="text-lg font-bold mb-4 text-fg">Favorites Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorFavorites" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="favorites" stroke="#ec4899" fillOpacity={1} fill="url(#colorFavorites)" name="New Favorites" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Performing Novels Table */}
            <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
                <h3 className="text-lg font-bold mb-4 text-fg">Top Performing Novels</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-fg">Novel</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-fg">Chapters</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-fg">Favorites</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-fg">Rating</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-fg">Reviews</th>
                            </tr>
                        </thead>
                        <tbody>
                            {novelPerformanceData.slice(0, 5).map((novel, index) => (
                                <tr key={index} className="border-b border-border hover:bg-bg transition-colors">
                                    <td className="py-3 px-4 text-sm text-fg">{novel.name}</td>
                                    <td className="py-3 px-4 text-sm text-center text-fg">{novel.chapters}</td>
                                    <td className="py-3 px-4 text-sm text-center">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                            {novel.favorites}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-center">
                                        {novel.avgRating > 0 ? (
                                            <span className="inline-flex items-center gap-1">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="font-medium">{novel.avgRating.toFixed(1)}</span>
                                            </span>
                                        ) : (
                                            <span className="text-muted">No ratings</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-center text-fg">{novel.ratings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-muted/10 rounded-xl p-6 border border-border">
                <h3 className="text-lg font-bold mb-3 text-fg">📊 Insights & Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-fg">
                    <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Your engagement is trending up! Keep publishing regularly.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">💡</span>
                        <span>Novels with more chapters tend to get more favorites.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">📈</span>
                        <span>Response to reader comments can boost engagement.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">⭐</span>
                        <span>Encourage readers to rate and review your work.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
