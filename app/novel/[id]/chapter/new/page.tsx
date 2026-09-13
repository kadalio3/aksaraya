"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { use } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CreateChapterPage({ params }: PageProps) {
    const { id: novelId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [publishStatus, setPublishStatus] = useState<"draft" | "publish" | "schedule">("draft");
    const [scheduleDate, setScheduleDate] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        // Determine publish status
        let isPublished = false;
        let publishedAt = null;

        if (publishStatus === "publish") {
            isPublished = true;
            publishedAt = new Date().toISOString();
        } else if (publishStatus === "schedule" && scheduleDate) {
            isPublished = false;
            publishedAt = new Date(scheduleDate).toISOString();
        }

        const data = {
            novelId,
            title: formData.get("title") as string,
            content: formData.get("content") as string,
            isPublished,
            publishedAt,
        };

        try {
            const res = await fetch("/api/chapter/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.message || "Failed to create chapter");
            }

            const chapter = responseData.chapter || responseData;

            if (!chapter.id) {
                throw new Error("Invalid response from server");
            }

            router.push(`/novel/${novelId}/chapter/${chapter.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg py-12">
            <Container size="lg">
                <div className="bg-surface rounded-2xl shadow-sm p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={`/novel/${novelId}`} className="text-accent hover:underline text-sm mb-4 inline-block">
                            ← Back to Novel
                        </Link>
                        <h1 className="text-4xl font-bold text-fg">
                            Create New Chapter
                        </h1>
                        <p className="text-muted mt-2">Write your next chapter</p>
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
                            placeholder="Enter chapter title"
                            helperText="A descriptive title for this chapter"
                        />

                        {/* Content Editor with Toolbar */}
                        <div>
                            <label className="block text-sm font-medium text-fg mb-2">
                                Chapter Content
                            </label>

                            {/* Markdown Formatting Toolbar */}
                            <div className="mb-2 p-3 bg-bg border border-border rounded-t-lg flex flex-wrap gap-2">
                                <span className="text-xs text-muted font-medium mr-2">Markdown:</span>
                                <button
                                    type="button"
                                    className="text-xs px-2 py-1 bg-surface border border-border rounded hover:bg-bg"
                                    title="Bold"
                                    onClick={() => {
                                        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const text = textarea.value;
                                        const selectedText = text.substring(start, end);
                                        textarea.value = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                                    }}
                                >
                                    <strong>B</strong>
                                </button>
                                <button
                                    type="button"
                                    className="text-xs px-2 py-1 bg-surface border border-border rounded hover:bg-bg"
                                    title="Italic"
                                    onClick={() => {
                                        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const text = textarea.value;
                                        const selectedText = text.substring(start, end);
                                        textarea.value = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                                    }}
                                >
                                    <em>I</em>
                                </button>
                                <span className="text-xs text-muted ml-2">
                                    **bold** | *italic* | # Heading | - List
                                </span>
                            </div>

                            <Textarea
                                name="content"
                                required
                                rows={20}
                                placeholder="Write your chapter content here...

You can use Markdown formatting:
**Bold Text**
*Italic Text*
# Heading
- List item

Press Enter to create new paragraphs."
                                className="rounded-t-none"
                            />
                            <p className="mt-2 text-xs text-muted">
                                Supports basic Markdown formatting. Plain text is also fine.
                            </p>
                        </div>

                        {/* Publish Options */}
                        <div className="space-y-4 p-4 border-2 border-dashed border-border rounded-lg">
                            <h3 className="font-semibold text-fg">Publishing Options</h3>

                            <div className="space-y-3">
                                {/* Draft */}
                                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-bg transition-colors">
                                    <input
                                        type="radio"
                                        name="publishOption"
                                        value="draft"
                                        checked={publishStatus === "draft"}
                                        onChange={() => setPublishStatus("draft")}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-fg">Save as Draft</div>
                                        <div className="text-sm text-muted">
                                            Keep this chapter private. Only you can see it.
                                        </div>
                                    </div>
                                </label>

                                {/* Publish Now */}
                                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-bg transition-colors">
                                    <input
                                        type="radio"
                                        name="publishOption"
                                        value="publish"
                                        checked={publishStatus === "publish"}
                                        onChange={() => setPublishStatus("publish")}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-fg">Publish Immediately</div>
                                        <div className="text-sm text-muted">
                                            Make this chapter available to all readers now.
                                        </div>
                                    </div>
                                </label>

                                {/* Schedule */}
                                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-bg transition-colors">
                                    <input
                                        type="radio"
                                        name="publishOption"
                                        value="schedule"
                                        checked={publishStatus === "schedule"}
                                        onChange={() => setPublishStatus("schedule")}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-fg">Schedule Publishing</div>
                                        <div className="text-sm text-muted mb-2">
                                            Set a future date and time to automatically publish.
                                        </div>
                                        {publishStatus === "schedule" && (
                                            <Input
                                                type="datetime-local"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                required={publishStatus === "schedule"}
                                                className="max-w-xs"
                                            />
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? "Creating..." : publishStatus === "publish" ? "Publish Chapter" : "Save Chapter"}
                            </Button>
                            <Link href={`/novel/${novelId}`} className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>

                    {/* Tips */}
                    <div className="mt-8 p-6 bg-muted/10 rounded-xl border border-border">
                        <h3 className="font-semibold text-fg mb-2">💡 Writing Tips</h3>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• Chapters will be automatically numbered in order</li>
                            <li>• Use Markdown for formatting (bold, italic, headings)</li>
                            <li>• Draft chapters are only visible to you until published</li>
                            <li>• Scheduled chapters will publish automatically at the set time</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    );
}
