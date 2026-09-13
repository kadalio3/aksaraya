"use client";

import { useState } from "react";
import { StarRating } from "./star-rating";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

interface RatingFormProps {
    novelId: string;
    existingRating?: {
        rating: number;
        review: string | null;
    } | null;
    onSuccess: () => void;
}

export function RatingForm({ novelId, existingRating, onSuccess }: RatingFormProps) {
    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [review, setReview] = useState(existingRating?.review || "");
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            showToast("Please select a star rating", "error");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/rating/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    novelId,
                    rating,
                    review: review.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit rating");
            }

            showToast(
                existingRating ? "Rating updated successfully" : "Rating submitted successfully",
                "success"
            );
            onSuccess();
        } catch (error: any) {
            showToast(error.message || "Failed to submit rating", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">
                {existingRating ? "Update Your Rating" : "Rate This Novel"}
            </h3>

            {/* Star Rating */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-fg mb-2">
                    Your Rating
                </label>
                <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            {/* Review Text */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-fg mb-2">
                    Write a Review (Optional)
                </label>
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your thoughts about this novel..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                    maxLength={5000}
                    disabled={loading}
                />
                <div className="text-xs text-muted mt-1">
                    {review.length}/5000
                </div>
            </div>

            <Button type="submit" variant="primary" disabled={loading || rating === 0}>
                {loading ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
            </Button>
        </form>
    );
}
