"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
    novelId: string;
    initialFavorited: boolean;
}

export function FavoriteButton({ novelId, initialFavorited }: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleToggle = async () => {
        setLoading(true);

        try {
            const res = await fetch("/api/favorite/toggle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ novelId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to toggle favorite");
            }

            setFavorited(data.favorited);
            showToast(
                data.favorited ? "Added to favorites" : "Removed from favorites",
                data.favorited ? "success" : "delete"
            );
            router.refresh();
        } catch (error: any) {
            showToast(error.message || "Failed to update favorite", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleToggle}
            variant={favorited ? "secondary" : "outline"}
            disabled={loading}
        >
            {loading ? "..." : favorited ? "★ Favorited" : "☆ Add to Favorites"}
        </Button>
    );
}
