"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
    chapterId: string;
    parentId?: string | null;
    initialContent?: string;
    onSuccess: () => void;
    onCancel?: () => void;
    placeholder?: string;
    buttonText?: string;
}

export function CommentForm({
    chapterId,
    parentId = null,
    initialContent = "",
    onSuccess,
    onCancel,
    placeholder = "Share your thoughts...",
    buttonText = "Post Comment",
}: CommentFormProps) {
    const [content, setContent] = useState(initialContent);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync initialContent when it changes (e.g. replying to different users)
    useEffect(() => {
        setContent(initialContent);
        if (initialContent && textareaRef.current) {
            textareaRef.current.focus();
            // Place cursor at end
            textareaRef.current.selectionStart = initialContent.length;
            textareaRef.current.selectionEnd = initialContent.length;
        }
    }, [initialContent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            showToast("Comment cannot be empty", "error");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/comment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    chapterId,
                    parentId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to post comment");
            }

            showToast("Comment posted successfully", "success");
            setContent("");
            onSuccess();
        } catch (error: any) {
            showToast(error.message || "Failed to post comment", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={parentId ? 2 : 4}
                className="w-full px-4 py-3 border border-border rounded-xl focus:border-accent focus:outline-none resize-none placeholder:text-muted"
                disabled={loading}
                maxLength={5000}
            />

            <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                    {content.length}/5000
                </span>

                <div className="flex gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" variant="primary" size="sm" disabled={loading || !content.trim()}>
                        {loading ? "Posting..." : buttonText}
                    </Button>
                </div>
            </div>
        </form>
    );
}
