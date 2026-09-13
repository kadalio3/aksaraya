"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, StarOff, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Novel {
    id: string;
    title: string;
    coverUrl: string | null;
    featured: boolean;
    author: { name: string | null };
    _count: { chapters: number; favorites: number };
}

interface FeaturedManagerProps {
    studioToken: string;
}

export function FeaturedManager({ studioToken }: FeaturedManagerProps) {
    const [novels, setNovels] = useState<Novel[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/featured?token=${studioToken}`)
            .then((r) => r.json())
            .then((data) => { setNovels(data); setLoading(false); });
    }, [studioToken]);

    const handleToggle = async (novel: Novel) => {
        setToggling(novel.id);
        const res = await fetch(`/api/featured?token=${studioToken}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: novel.id, featured: !novel.featured }),
        });
        if (res.ok) {
            setNovels((prev) =>
                prev.map((n) => n.id === novel.id ? { ...n, featured: !n.featured } : n)
            );
        }
        setToggling(null);
    };

    const filtered = novels.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.author.name?.toLowerCase().includes(search.toLowerCase())
    );

    const featuredCount = novels.filter((n) => n.featured).length;

    if (loading) {
        return <div className="text-sm text-muted py-8 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Info */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                    <span className="font-semibold text-fg">{featuredCount}</span> novel ditampilkan di hero carousel (maks 6)
                </span>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari novel..."
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-bg text-fg text-sm focus:border-accent focus:outline-none"
                />
            </div>

            {/* Novel list */}
            <div className="space-y-1">
                {filtered.map((novel) => (
                    <div
                        key={novel.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            novel.featured
                                ? "border-accent/30 bg-accent/5"
                                : "border-border bg-surface"
                        }`}
                    >
                        {/* Cover */}
                        <div className="w-10 h-14 rounded overflow-hidden bg-muted/10 flex-shrink-0">
                            {novel.coverUrl ? (
                                <Image src={novel.coverUrl} alt={novel.title} width={40} height={56} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted">
                                    {novel.title.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-fg truncate">{novel.title}</h4>
                            <p className="text-xs text-muted">
                                {novel.author.name || "Unknown"} · {novel._count.chapters} ch · {novel._count.favorites} fav
                            </p>
                        </div>

                        {/* Toggle */}
                        <button
                            onClick={() => handleToggle(novel)}
                            disabled={toggling === novel.id || (!novel.featured && featuredCount >= 6)}
                            className={`p-2 rounded-lg transition-colors ${
                                novel.featured
                                    ? "text-amber-500 hover:bg-amber-500/10"
                                    : "text-muted hover:text-fg hover:bg-bg"
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                            title={novel.featured ? "Hapus dari featured" : featuredCount >= 6 ? "Maksimal 6 featured" : "Tambah ke featured"}
                        >
                            {novel.featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                        </button>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-sm text-muted text-center py-8">Tidak ada novel ditemukan</p>
            )}
        </div>
    );
}
