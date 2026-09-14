"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoverUploader } from "@/components/novel/cover-uploader";
import Link from "next/link";
import { use } from "react";

interface Author {
    id: string;
    name: string;
    originalLanguage: string | null;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditNovelPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [novel, setNovel] = useState<any>(null);
    const [coverUrl, setCoverUrl] = useState("");
    const [authors, setAuthors] = useState<Author[]>([]);
    const [selectedAuthorId, setSelectedAuthorId] = useState("");
    const [showNewAuthor, setShowNewAuthor] = useState(false);
    const [newAuthorName, setNewAuthorName] = useState("");
    const [newAuthorLang, setNewAuthorLang] = useState("");

    useEffect(() => {
        Promise.all([
            fetch(`/api/novel/${id}`).then((res) => res.json()),
            fetch("/api/author/list").then((res) => res.json()).catch(() => []),
        ])
            .then(([novelData, authorData]) => {
                setNovel(novelData);
                setCoverUrl(novelData.coverUrl || "");
                setSelectedAuthorId(novelData.authorId || "");
                if (Array.isArray(authorData)) setAuthors(authorData);
                setLoading(false);
            })
            .catch(() => {
                setError("Gagal memuat novel");
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
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
            id,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            genres: formData.get("genres") as string,
            tags: formData.get("tags") as string,
            coverUrl: coverUrl || undefined,
            status: formData.get("status") as string,
            updateSchedule: (formData.get("updateSchedule") as string) || undefined,
            totalChapters: formData.get("totalChapters")
                ? parseInt(formData.get("totalChapters") as string)
                : undefined,
            authorId,
        };

        try {
            const res = await fetch("/api/novel/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Gagal menyimpan perubahan");
            }

            router.push(`/novel/${id}`);
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-muted">Memuat novel...</p>
                </div>
            </div>
        );
    }

    if (!novel) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-muted">{error || "Novel tidak ditemukan"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg py-12">
            <Container size="md">
                <div className="bg-surface rounded-2xl shadow-sm p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={`/novel/${id}`} className="text-accent hover:underline text-sm mb-4 inline-block">
                            ← Kembali ke Novel
                        </Link>
                        <h1 className="text-4xl font-bold text-fg">
                            Edit Novel
                        </h1>
                        <p className="text-muted mt-2">Perbarui detail novel terjemahan kamu</p>
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
                            defaultValue={novel.title}
                            placeholder="Masukkan judul novel"
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
                            defaultValue={novel.description}
                            placeholder="Tulis sinopsis novel..."
                        />

                        {/* Cover Upload */}
                        <CoverUploader
                            currentCoverUrl={novel.coverUrl}
                            onCoverChange={setCoverUrl}
                        />

                        {/* Genres */}
                        <Input
                            label="Genre"
                            name="genres"
                            required
                            defaultValue={novel.genres}
                            placeholder="Fantasy, Romance, Action"
                            helperText="Pisahkan genre dengan koma"
                        />

                        {/* Tags */}
                        <Input
                            label="Tag (Opsional)"
                            name="tags"
                            defaultValue={novel.tags}
                            placeholder="cultivation, reinkarnasi, op-mc"
                            helperText="Pisahkan tag dengan koma"
                        />

                        {/* Novel Status */}
                        <div>
                            <label className="block text-sm font-medium text-fg mb-2">
                                Status Terjemahan *
                            </label>
                            <select
                                name="status"
                                defaultValue={novel.status || "ONGOING"}
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
                            defaultValue={novel.updateSchedule || ""}
                            placeholder="Contoh: Setiap Senin dan Kamis"
                            helperText="Beritahu pembaca kapan chapter baru akan terbit"
                        />

                        {/* Total Chapters */}
                        <Input
                            label="Total Chapter (Opsional)"
                            name="totalChapters"
                            type="number"
                            min="1"
                            defaultValue={novel.totalChapters || ""}
                            placeholder="Contoh: 100"
                            helperText="Jumlah total chapter dari novel asli"
                        />

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                            <Link href={`/novel/${id}`} className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </Container>
        </div>
    );
}
