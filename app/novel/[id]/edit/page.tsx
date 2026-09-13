"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoverUploader } from "@/components/novel/cover-uploader";
import Link from "next/link";
import { use } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditNovelPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [novel, setNovel] = useState<any>(null);
    const [coverUrl, setCoverUrl] = useState("");

    useEffect(() => {
        fetch(`/api/novel/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setNovel(data);
                setCoverUrl(data.coverUrl || "");
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load novel");
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            id,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            genres: formData.get("genres") as string,
            tags: formData.get("tags") as string,
            coverUrl: coverUrl || undefined,
            status: formData.get("status") as string,
            updateSchedule: formData.get("updateSchedule") as string || undefined,
            totalChapters: formData.get("totalChapters")
                ? parseInt(formData.get("totalChapters") as string)
                : undefined,
        };

        try {
            const res = await fetch("/api/novel/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Failed to update novel");
            }

            router.push(`/novel/${id}`);
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-muted">Loading novel...</p>
                </div>
            </div>
        );
    }

    if (!novel) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-muted">{error || "Novel not found"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg py-12">
            <Container size="md">
                <div className="bg-surface rounded-2xl shadow-sm p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={`/novel/${id}`} className="text-accent hover:underline text-sm mb-4 inline-block">
                            ← Back to Novel
                        </Link>
                        <h1 className="text-4xl font-bold text-fg">
                            Edit Novel
                        </h1>
                        <p className="text-muted mt-2">Update your novel details</p>
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
                            label="Novel Title"
                            name="title"
                            required
                            defaultValue={novel.title}
                            placeholder="Enter your novel's title"
                        />

                        {/* Description */}
                        <Textarea
                            label="Description"
                            name="description"
                            required
                            rows={6}
                            defaultValue={novel.description}
                            placeholder="Write a compelling synopsis..."
                        />

                        {/* Cover Upload */}
                        <CoverUploader
                            currentCoverUrl={novel.coverUrl}
                            onCoverChange={setCoverUrl}
                        />

                        {/* Genres */}
                        <Input
                            label="Genres"
                            name="genres"
                            required
                            defaultValue={novel.genres}
                            placeholder="Fantasy, Romance, Action"
                            helperText="Separate multiple genres with commas"
                        />

                        {/* Tags */}
                        <Input
                            label="Tags (Optional)"
                            name="tags"
                            defaultValue={novel.tags}
                            placeholder="magic, adventure, dragons"
                            helperText="Separate tags with commas"
                        />

                        {/* Novel Status */}
                        <div>
                            <label className="block text-sm font-medium text-fg mb-2">
                                Publication Status *
                            </label>
                            <select
                                name="status"
                                defaultValue={novel.status || "ONGOING"}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ONGOING">📖 Ongoing</option>
                                <option value="COMPLETED">✅ Completed</option>
                                <option value="HIATUS">⏸️ Hiatus</option>
                                <option value="DROPPED">❌ Dropped</option>
                            </select>
                            <p className="text-xs text-muted mt-1">Current status of your novel</p>
                        </div>

                        {/* Update Schedule */}
                        <Input
                            label="Update Schedule (Optional)"
                            name="updateSchedule"
                            defaultValue={novel.updateSchedule || ""}
                            placeholder="e.g., Weekly updates every Monday"
                            helperText="Let readers know when to expect new chapters"
                        />

                        {/* Total Chapters */}
                        <Input
                            label="Planned Total Chapters (Optional)"
                            name="totalChapters"
                            type="number"
                            min="1"
                            defaultValue={novel.totalChapters || ""}
                            placeholder="e.g., 100"
                            helperText="Approximately how many chapters do you plan?"
                        />

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
                            <Link href={`/novel/${id}`} className="flex-1">
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
