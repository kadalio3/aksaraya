"use client";

import { useState, useEffect } from "react";
import { RatingDisplay } from "./star-rating";
import { RatingForm } from "./rating-form";
import { formatDate } from "@/lib/utils";

interface Rating {
    id: string;
    rating: number;
    review: string | null;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

interface RatingSectionProps {
    novelId: string;
    currentUserId?: string;
    initialAverage?: number;
    initialTotal?: number;
}

export function RatingSection({
    novelId,
    currentUserId,
    initialAverage = 0,
    initialTotal = 0,
}: RatingSectionProps) {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [userRating, setUserRating] = useState<Rating | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchRatings = async () => {
        try {
            const res = await fetch(`/api/rating/list?novelId=${novelId}`);
            const data = await res.json();

            if (res.ok) {
                setRatings(data.ratings);
                setBreakdown(data.breakdown);

                // Find current user's rating
                if (currentUserId) {
                    const myRating = data.ratings.find((r: Rating) => r.user.id === currentUserId);
                    setUserRating(myRating || null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch ratings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, [novelId]);

    const totalBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            {/* Rating Overview */}
            <div className="bg-surface rounded-2xl p-8 border border-border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Overall Rating */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold mb-4">Reader Ratings</h2>
                        <RatingDisplay average={initialAverage} total={initialTotal} size="lg" />

                        {currentUserId && (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="mt-4 text-accent hover:text-accent font-semibold"
                            >
                                {userRating ? "Update Your Rating" : "Rate This Novel"}
                            </button>
                        )}
                    </div>

                    {/* Right: Star Breakdown */}
                    <div>
                        <h3 className="font-semibold mb-3">Rating Breakdown</h3>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = breakdown[star as keyof typeof breakdown];
                                const percentage = totalBreakdown > 0 ? (count / totalBreakdown) * 100 : 0;

                                return (
                                    <div key={star} className="flex items-center gap-3">
                                        <span className="w-16 text-sm font-medium">{star} ⭐</span>
                                        <div className="flex-1 bg-border rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-amber-500 h-full rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-12 text-sm text-muted">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Form */}
            {showForm && currentUserId && (
                <RatingForm
                    novelId={novelId}
                    existingRating={userRating}
                    onSuccess={() => {
                        fetchRatings();
                        setShowForm(false);
                    }}
                />
            )}

            {/* Reviews List */}
            <div>
                <h3 className="text-xl font-bold mb-4">
                    Reviews ({ratings.filter((r) => r.review).length})
                </h3>

                {loading ? (
                    <div className="text-center py-8 text-muted">Loading reviews...</div>
                ) : ratings.filter((r) => r.review).length === 0 ? (
                    <div className="text-center py-12 bg-bg rounded-xl">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-muted">No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ratings
                            .filter((r) => r.review)
                            .map((rating) => (
                                <div
                                    key={rating.id}
                                    className="bg-surface rounded-xl border border-border p-6"
                                >
                                    {/* Review Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                                                {rating.user.name?.[0]?.toUpperCase() || rating.user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{rating.user.name || "Anonymous"}</p>
                                                <p className="text-sm text-muted">
                                                    {formatDate(new Date(rating.createdAt))}
                                                </p>
                                            </div>
                                        </div>
                                        <RatingDisplay average={rating.rating} total={1} size="sm" />
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-fg whitespace-pre-wrap">{rating.review}</p>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
