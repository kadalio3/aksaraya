"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { use } from "react";

interface PageProps {
    params: Promise<{ id: string; chapterId: string }>;
}

export default function EditChapterPage({ params }: PageProps) {
    const { id: novelId, chapterId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [chapter, setChapter] = useState<any>(null);

    useEffect(() => {
        // Fetch chapter data
        fetch(`/api/chapter/${chapterId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    throw new Error(data.error);
                }
                setChapter(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Failed to load chapter");
                setLoading(false);
            });
    }, [chapterId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            id: chapterId,
            title: formData.get("title") as string,
            content: formData.get("content") as string,
            isPublished: formData.get("isPublished") === "on",
        };

        try {
            const res = await fetch("/api/chapter/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || responseData.message || "Failed to update chapter");
            }

            router.push(`/novel/${novelId}/chapter/${chapterId}`);
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-center">
                    
                    <p className="text-muted">Loading chapter...</p>
                </div>
            </div>
        );
    }

    if (!chapter || error) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-muted">{error || "Chapter not found"}</p>
                    <Link href={`/novel/${novelId}`} className="mt-4 inline-block">
                        <Button variant="outline">Back to Novel</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg py-12">
            <Container size="lg">
                <div className="bg-surface rounded-2xl shadow-sm p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={`/novel/${novelId}/chapter/${chapterId}`} className="text-accent hover:underline text-sm mb-4 inline-block">
                            ← Back to Chapter
                        </Link>
                        <h1 className="text-4xl font-bold text-fg">
                            Edit Chapter
                        </h1>
                        <p className="text-muted mt-2">Update your chapter details</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Title */}
                        <Input
                            label="Chapter Title"
                            name="title"
                            required
                            defaultValue={chapter.title}
                            placeholder="Enter chapter title"
                        />

                        {/* Content */}
                        <Textarea
                            label="Chapter Content"
                            name="content"
                            required
                            rows={20}
                            defaultValue={chapter.content}
                            placeholder="Write your chapter content here..."
                        />

                        {/* Publish Status */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <input
                                type="checkbox"
                                name="isPublished"
                                id="isPublished"
                                defaultChecked={chapter.isPublished}
                                className="w-5 h-5 text-accent rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="isPublished" className="text-sm font-medium text-fg cursor-pointer">
                                Published
                            </label>
                        </div>
                        <p className="text-xs text-muted -mt-4 ml-8">
                            {chapter.isPublished
                                ? "This chapter is currently visible to readers"
                                : "This chapter is a draft and only visible to you"}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                            <Link href={`/novel/${novelId}/chapter/${chapterId}`} className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </Container>
        </div>
    );
}
