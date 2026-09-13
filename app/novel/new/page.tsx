"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoverUploader } from "@/components/novel/cover-uploader";
import Link from "next/link";

export default function CreateNovelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [coverUrl, setCoverUrl] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            genres: formData.get("genres") as string,
            tags: formData.get("tags") as string || "",
            coverUrl: coverUrl || undefined,
            status: formData.get("status") as string,
            updateSchedule: formData.get("updateSchedule") as string || undefined,
            totalChapters: formData.get("totalChapters")
                ? parseInt(formData.get("totalChapters") as string)
                : undefined,
        };

        try {
            const res = await fetch("/api/novel/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create novel");
            }

            const novel = await res.json();
            router.push(`/novel/${novel.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg py-12">
            <Container size="md">
                <div className="bg-surface rounded-2xl shadow-sm p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard/author" className="text-accent hover:underline text-sm mb-4 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-fg">
                            Create New Novel
                        </h1>
                        <p className="text-muted mt-2">Fill in the details to publish your masterpiece</p>
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
                            placeholder="Enter your novel's title"
                            helperText="A catchy title that captures the essence of your story"
                        />

                        {/* Description */}
                        <Textarea
                            label="Description"
                            name="description"
                            required
                            rows={6}
                            placeholder="Write a compelling synopsis that will hook your readers..."
                            helperText="Describe your novel's plot, themes, and what makes it unique"
                        />

                        {/* Cover Upload */}
                        <CoverUploader
                            onCoverChange={setCoverUrl}
                        />

                        {/* Genres */}
                        <div>
                            <Input
                                label="Genres"
                                name="genres"
                                required
                                placeholder="Fantasy, Romance, Action"
                                helperText="Separate multiple genres with commas"
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs text-muted">Popular:</span>
                                {["Fantasy", "Romance", "Action", "Mystery", "Sci-Fi", "Horror", "Comedy"].map((genre) => (
                                    <button
                                        key={genre}
                                        type="button"
                                        onClick={(e) => {
                                            const input = (e.currentTarget.form?.elements as any)["genres"];
                                            const current = input.value;
                                            if (!current.includes(genre)) {
                                                input.value = current ? `${current}, ${genre}` : genre;
                                            }
                                        }}
                                        className="px-2 py-1 text-xs bg-blue-50 text-accent rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <Input
                                label="Tags (Optional)"
                                name="tags"
                                placeholder="magic, adventure, strong-protagonist"
                                helperText="Separate tags with commas"
                            />
                        </div>

                        {/* Novel Status */}
                        <div>
                            <label className="block text-sm font-medium text-fg mb-2">
                                Publication Status *
                            </label>
                            <select
                                name="status"
                                defaultValue="ONGOING"
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
                            placeholder="e.g., Weekly updates every Monday"
                            helperText="Let readers know when to expect new chapters"
                        />

                        {/* Total Chapters */}
                        <Input
                            label="Planned Total Chapters (Optional)"
                            name="totalChapters"
                            type="number"
                            min="1"
                            placeholder="e.g., 100"
                            helperText="Approximately how many chapters do you plan?"
                        />

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? "Creating..." : "Create Novel"}
                            </Button>
                            <Link href="/dashboard/author" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="mt-8 p-6 bg-muted/10 rounded-xl border border-border">
                        <h3 className="font-semibold text-fg mb-2">📝 What's Next?</h3>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• After creating your novel, you can add chapters</li>
                            <li>• Upload a cover image to make it more appealing</li>
                            <li>• Publish chapters when you're ready to share with readers</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    );
}
