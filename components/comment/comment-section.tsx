"use client";

import { useState, useEffect } from "react";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

interface Comment {
    id: string;
    content: string;
    likes: number;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
    };
    replies?: Comment[];
    _count?: {
        replies: number;
        likedBy: number;
    };
}

interface CommentSectionProps {
    chapterId: string;
    currentUserId?: string;
}

export function CommentSection({ chapterId, currentUserId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState<"latest" | "top" | "oldest">("latest");
    const [total, setTotal] = useState(0);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/comment/list?chapterId=${chapterId}&sort=${sort}`);
            const data = await res.json();

            if (res.ok) {
                setComments(data.comments);
                setTotal(data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [chapterId, sort]);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                    Komentar {total > 0 && `(${total})`}
                </h2>

                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Urutkan:</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as any)}
                        className="px-3 py-1.5 border border-border rounded-lg text-sm focus:border-accent focus:outline-none"
                    >
                        <option value="latest">Terbaru</option>
                        <option value="top">Terpopuler</option>
                        <option value="oldest">Terlama</option>
                    </select>
                </div>
            </div>

            {/* Comment Form */}
            {currentUserId ? (
                <div className="mb-8">
                    <CommentForm chapterId={chapterId} onSuccess={fetchComments} />
                </div>
            ) : (
                <div className="mb-8 text-center py-8 bg-bg rounded-xl border border-border">
                    <p className="text-muted">Login untuk berkomentar</p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-border border-t-blue-600"></div>
                    <p className="text-muted mt-4">Loading comments...</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-16 bg-bg rounded-xl">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-muted text-lg">Belum ada komentar</p>
                    <p className="text-muted mt-2">Jadilah yang pertama berbagi pendapat!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            chapterId={chapterId}
                            currentUserId={currentUserId}
                            onRefresh={fetchComments}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
