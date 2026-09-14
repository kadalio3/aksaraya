"use client";

import { useState } from "react";
import { CommentForm } from "./comment-form";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { formatDate } from "@/lib/utils";

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

interface CommentItemProps {
    comment: Comment;
    chapterId: string;
    currentUserId?: string;
    onRefresh: () => void;
    isReply?: boolean;
    onReplyToReply?: (replyToName: string) => void;
}

export function CommentItem({
    comment,
    chapterId,
    currentUserId,
    onRefresh,
    isReply = false,
    onReplyToReply,
}: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyToName, setReplyToName] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { showToast } = useToast();

    const isOwner = currentUserId === comment.user.id;
    const isTranslator = comment.user.role === "TRANSLATOR";

    const handleLike = async () => {
        try {
            const res = await fetch("/api/comment/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId: comment.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to like comment");
            }

            setIsLiked(data.liked);
            setLikeCount(data.likes);
        } catch (error: any) {
            showToast(error.message || "Failed to like comment", "error");
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/comment/${comment.id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete comment");
            }

            showToast("Komentar dihapus", "delete");
            onRefresh();
        } catch (error: any) {
            showToast(error.message || "Failed to delete comment", "error");
        }
    };

    // Open reply form for top-level comment (directly or triggered by a nested reply)
    const openReplyForm = (mentionName?: string) => {
        setReplyToName(mentionName || null);
        setShowReplyForm(true);
    };

    return (
        <div className={`${isReply ? "ml-12" : ""}`}>
            <div className="flex gap-4">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-white font-bold ${isTranslator ? "ring-2 ring-accent" : ""}`}>
                    {comment.user.name?.[0]?.toUpperCase() || comment.user.email[0].toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-fg">
                            {comment.user.name || "Anonymous"}
                        </span>
                        {isTranslator && (
                            <span className="px-2 py-0.5 text-xs bg-accent text-accent-fg rounded-full font-medium">
                                Penerjemah
                            </span>
                        )}
                        <span className="text-sm text-muted">
                            {formatDate(new Date(comment.createdAt))}
                        </span>
                    </div>

                    {/* Comment Text — highlight @mentions */}
                    <p className="text-fg whitespace-pre-wrap break-words mb-3">
                        {comment.content.split(/(@\S+)/g).map((part, i) =>
                            part.startsWith("@") ? (
                                <span key={i} className="text-accent font-semibold">{part}</span>
                            ) : (
                                <span key={i}>{part}</span>
                            )
                        )}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-sm">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 ${isLiked ? "text-accent font-semibold" : "text-muted hover:text-accent"
                                } transition-colors`}
                        >
                            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>{likeCount}</span>
                        </button>

                        {/* Reply button — on top-level: open form directly; on reply: bubble up to parent */}
                        {!isReply ? (
                            <button
                                onClick={() => openReplyForm()}
                                className="text-muted hover:text-accent transition-colors font-medium"
                            >
                                Balas
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    if (onReplyToReply) {
                                        onReplyToReply(comment.user.name || comment.user.email);
                                    }
                                }}
                                className="text-muted hover:text-accent transition-colors font-medium"
                            >
                                Balas
                            </button>
                        )}

                        {isOwner && (
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="text-muted hover:text-red-600 transition-colors font-medium"
                            >
                                Hapus
                            </button>
                        )}
                    </div>

                    {/* Reply Form (only rendered on top-level comments) */}
                    {showReplyForm && !isReply && (
                        <div className="mt-4">
                            <CommentForm
                                chapterId={chapterId}
                                parentId={comment.id}
                                initialContent={replyToName ? `@${replyToName} ` : ""}
                                onSuccess={() => {
                                    setShowReplyForm(false);
                                    setReplyToName(null);
                                    onRefresh();
                                }}
                                onCancel={() => {
                                    setShowReplyForm(false);
                                    setReplyToName(null);
                                }}
                                placeholder={replyToName ? `Balas @${replyToName}...` : "Tulis balasan..."}
                                buttonText="Balas"
                            />
                        </div>
                    )}

                    {/* Nested Replies — flat, with reply-to-reply support */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    chapterId={chapterId}
                                    currentUserId={currentUserId}
                                    onRefresh={onRefresh}
                                    isReply={true}
                                    onReplyToReply={(name) => openReplyForm(name)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Komentar?"
                message="Apakah kamu yakin ingin menghapus komentar ini? Tindakan ini tidak bisa dibatalkan."
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
            />
        </div>
    );
}
