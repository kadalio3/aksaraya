"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoverUploader } from "@/components/novel/cover-uploader";
import Link from "next/link";

interface Author {
    id: string;
    name: string;
    originalLanguage: string | null;
}

export default function CreateNovelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [authors, setAuthors] = useState<Author[]>([]);
    const [selectedAuthorId, setSelectedAuthorId] = useState("");
    const [showNewAuthor, setShowNewAuthor] = useState(false);
    const [newAuthorName, setNewAuthorName] = useState("");
    const [newAuthorLang, setNewAuthorLang] = useState("");

    // Fetch existing authors
    useEffect(() => {
        fetch("/api/author/list")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setAuthors(data);
            })
            .catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        // Handle author: either existing or create new
        let authorId = selectedAuthorId || undefined;

        if (showNewAuthor && newAuthorName.trim()) {
            try {
                const authorRes = await fetch("/api/author/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: newAuthorName.trim(),
                        originalLanguage: newAuthorLang.trim() || undefined,
                    }),
                });
                if (authorRes.ok) {
                    const newAuthor = await authorRes.json();
                    authorId = newAuthor.id;
                }
            } catch {
                // Continue without author if creation fails
            }
        }

        const data = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            genres: formData.get("genres") as string,
            tags: (formData.get("tags") as string) || "",
            coverUrl: coverUrl || undefined,
            status: formData.get("status") as string,
            updateSchedule: (formData.get("updateSchedule") as string) || undefined,
            totalChapters: formData.get("totalChapters")
                ? parseInt(formData.get("totalChapters") as string)
                : undefined,
            authorId,
        };

        try {
            const res = await fetch("/api/novel/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Gagal membuat novel");
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
                            ← Kembali ke Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-fg">
                            Tambah Novel Baru
                        </h1>
                        <p className="text-muted mt-2">Isi detail novel yang akan kamu terjemahkan</p>
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
                            label="Judul Novel"
                            name="title"
                            required
                            placeholder="Masukkan judul novel"
                            helperText="Judul novel yang akan diterjemahkan"
                        />

                        {/* Author (Original) */}
                        <div>
                            <label className="block text-sm font-medium text-fg mb-2">
                                Penulis Asli (Opsional)
                            </label>

                            {!showNewAuthor ? (
                                <div className="space-y-2">
                                    <select
                                        value={selectedAuthorId}
                                        onChange={(e) => setSelectedAuthorId(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg text-fg focus:ring-2 focus:ring-accent/30 focus:border-accent transition-[border-color,box-shadow]"
                                    >
                                        <option value="">— Pilih penulis asli —</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name} {author.originalLanguage ? `(${author.originalLanguage})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewAuthor(true);
                                            setSelectedAuthorId("");
                                        }}
                                        className="text-sm text-accent hover:underline"
                                    >
                                        + Tambah penulis baru
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/5">
                                    <Input
                                        label="Nama Penulis"
                                        value={newAuthorName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAuthorName(e.target.value)}
                                        placeholder="Contoh: Tian Can Tu Dou"
                                    />
                                    <Input
                                        label="Bahasa Asli (Opsional)"
                                        value={newAuthorLang}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAuthorLang(e.target.value)}
                                        placeholder="Contoh: Chinese, Korean, Japanese"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewAuthor(false);
                                            setNewAuthorName("");
                                            setNewAuthorLang("");
                                        }}
                                        className="text-sm text-muted hover:text-fg"
                                    >
                                        ← Pilih dari daftar
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-muted mt-1">Penulis asli dari novel original</p>
                        </div>

                        {/* Description */}
                        <Textarea
                            label="Sinopsis"
                            name="description"
                            required
                            rows={6}
                            placeholder="Tulis sinopsis novel..."
                            helperText="Sinopsis novel yang menarik untuk pembaca"
                        />

                        {/* Cover Upload */}
                        <CoverUploader
                            onCoverChange={setCoverUrl}
                        />

                        {/* Genres */}
                        <div>
                            <Input
                                label="Genre"
                                name="genres"
                                required
                                placeholder="Fantasy, Romance, Action"
                                helperText="Pisahkan genre dengan koma"
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs text-muted">Populer:</span>
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
                                label="Tag (Opsional)"
                                name="tags"
                                placeholder="cultivation, reinkarnasi, op-mc"
                                helperText="Pisahkan tag dengan koma"
                            />
                        </div>

                        {/* Novel Status */}
                        <div>
                            <label className="block text-sm font-medium text-fg mb-2">
                                Status Terjemahan *
                            </label>
                            <select
                                name="status"
                                defaultValue="ONGOING"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-bg text-fg focus:ring-2 focus:ring-accent/30 focus:border-accent transition-[border-color,box-shadow]"
                            >
                                <option value="ONGOING">📖 Ongoing</option>
                                <option value="COMPLETED">✅ Completed</option>
                                <option value="HIATUS">⏸️ Hiatus</option>
                                <option value="DROPPED">❌ Dropped</option>
                            </select>
                            <p className="text-xs text-muted mt-1">Status terjemahan saat ini</p>
                        </div>

                        {/* Update Schedule */}
                        <Input
                            label="Jadwal Update (Opsional)"
                            name="updateSchedule"
                            placeholder="Contoh: Setiap Senin dan Kamis"
                            helperText="Beritahu pembaca kapan chapter baru akan terbit"
                        />

                        {/* Total Chapters */}
                        <Input
                            label="Total Chapter (Opsional)"
                            name="totalChapters"
                            type="number"
                            min="1"
                            placeholder="Contoh: 100"
                            helperText="Jumlah total chapter dari novel asli"
                        />

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? "Membuat..." : "Buat Novel"}
                            </Button>
                            <Link href="/dashboard/author" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="mt-8 p-6 bg-muted/10 rounded-xl border border-border">
                        <h3 className="font-semibold text-fg mb-2">📝 Langkah Selanjutnya</h3>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• Setelah membuat novel, kamu bisa mulai menambah chapter</li>
                            <li>• Upload cover agar novel lebih menarik</li>
                            <li>• Publikasikan chapter ketika sudah siap dibaca</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    );
}
