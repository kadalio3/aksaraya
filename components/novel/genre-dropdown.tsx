"use client";

import { useRouter } from "next/navigation";

interface GenreDropdownProps {
    currentGenre: string;
    genres: string[];
    query: string;
    sort: string;
    status: string;
}

export function GenreDropdown({ currentGenre, genres, query, sort, status }: GenreDropdownProps) {
    const router = useRouter();

    function buildGenreUrl(genre: string) {
        const p: Record<string, string> = { sort, status, page: "1" };
        if (query) p.query = query;
        if (genre) p.genre = genre;
        const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
        return `/novel${qs ? `?${qs}` : ""}`;
    }

    return (
        <div className="relative">
            <select
                value={currentGenre}
                onChange={(e) => router.push(buildGenreUrl(e.target.value))}
                className="w-full appearance-none px-4 py-2.5 rounded-lg border border-border bg-surface text-fg text-sm focus:border-accent focus:outline-none transition-[border-color] duration-300 cursor-pointer"
            >
                <option value="">Select</option>
                {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}
