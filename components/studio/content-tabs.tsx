"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Novel {
    id: string;
    title: string;
    description: string;
    translator: {
        name: string | null;
        email: string;
    };
    _count: {
        chapters: number;
    };
    createdAt: Date;
}

interface Chapter {
    id: string;
    title: string;
    order: number;
    isPublished: boolean;
    novel: {
        id: string;
        title: string;
    };
    createdAt: Date;
}

interface ContentTabsProps {
    novels: Novel[];
    chapters: Chapter[];
    studioToken: string;
}

export function ContentTabs({ novels, chapters, studioToken }: ContentTabsProps) {
    const [activeTab, setActiveTab] = useState<"novels" | "chapters">("novels");

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-border">
                <button
                    onClick={() => setActiveTab("novels")}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === "novels"
                            ? "text-accent border-b-2 border-purple-600"
                            : "text-muted hover:text-fg"
                        }`}
                >
                    📚 Novels ({novels.length})
                </button>
                <button
                    onClick={() => setActiveTab("chapters")}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === "chapters"
                            ? "text-accent border-b-2 border-purple-600"
                            : "text-muted hover:text-fg"
                        }`}
                >
                    📖 Chapters ({chapters.length})
                </button>
            </div>

            {/* Novels Tab */}
            {activeTab === "novels" && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Novels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold">Title</th>
                                        <th className="text-left py-3 px-4 font-semibold">Penerjemah</th>
                                        <th className="text-center py-3 px-4 font-semibold">Chapters</th>
                                        <th className="text-left py-3 px-4 font-semibold">Created</th>
                                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {novels.map((novel) => (
                                        <tr key={novel.id} className="border-b hover:bg-bg">
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/novel/${novel.id}`}
                                                    className="font-medium text-accent hover:underline"
                                                >
                                                    {novel.title}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted">
                                                {novel.translator.name || novel.translator.email}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="px-2 py-1 bg-accent/10 text-blue-800 rounded text-sm font-medium">
                                                    {novel._count.chapters}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted">
                                                {new Date(novel.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/novel/${novel.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Chapters Tab */}
            {activeTab === "chapters" && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Chapters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold">Chapter</th>
                                        <th className="text-left py-3 px-4 font-semibold">Novel</th>
                                        <th className="text-center py-3 px-4 font-semibold">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold">Created</th>
                                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chapters.map((chapter) => (
                                        <tr key={chapter.id} className="border-b hover:bg-bg">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">
                                                    Ch. {chapter.order}: {chapter.title}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <Link
                                                    href={`/novel/${chapter.novel.id}`}
                                                    className="text-accent hover:underline"
                                                >
                                                    {chapter.novel.title}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {chapter.isPublished ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted">
                                                {new Date(chapter.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/novel/${chapter.novel.id}/chapter/${chapter.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
