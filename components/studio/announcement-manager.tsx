"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Megaphone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Announcement {
    id: string;
    title: string;
    content: string | null;
    active: boolean;
    createdAt: string;
}

interface AnnouncementManagerProps {
    studioToken: string;
}

export function AnnouncementManager({ studioToken }: AnnouncementManagerProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Announcement | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: "", content: "" });
    const [saving, setSaving] = useState(false);

    const fetchAnnouncements = async () => {
        const res = await fetch("/api/announcements");
        if (res.ok) setAnnouncements(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const resetForm = () => {
        setForm({ title: "", content: "" });
        setEditing(null);
        setCreating(false);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setSaving(true);

        if (editing) {
            const res = await fetch(`/api/announcements?token=${studioToken}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editing.id, ...form }),
            });
            if (res.ok) { await fetchAnnouncements(); resetForm(); }
        } else {
            const res = await fetch(`/api/announcements?token=${studioToken}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) { await fetchAnnouncements(); resetForm(); }
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus pengumuman ini?")) return;
        await fetch(`/api/announcements?token=${studioToken}&id=${id}`, { method: "DELETE" });
        await fetchAnnouncements();
    };

    const handleToggle = async (item: Announcement) => {
        await fetch(`/api/announcements?token=${studioToken}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id, active: !item.active }),
        });
        await fetchAnnouncements();
    };

    const startEdit = (item: Announcement) => {
        setEditing(item);
        setCreating(false);
        setForm({ title: item.title, content: item.content || "" });
    };

    const startCreate = () => {
        setEditing(null);
        setCreating(true);
        setForm({ title: "", content: "" });
    };

    if (loading) {
        return <div className="text-sm text-muted py-8 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Create / Edit Form */}
            {(creating || editing) && (
                <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-fg">
                        {editing ? "Edit Pengumuman" : "Pengumuman Baru"}
                    </h3>
                    <Input
                        label="Judul"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Judul pengumuman"
                    />
                    <div>
                        <label className="block text-sm font-medium text-fg mb-1">Konten (opsional)</label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="Detail pengumuman..."
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-fg text-sm focus:border-accent focus:outline-none resize-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.title.trim()}>
                            {saving ? "Menyimpan..." : editing ? "Simpan" : "Buat"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetForm}>
                            Batal
                        </Button>
                    </div>
                </div>
            )}

            {/* Header */}
            {!creating && !editing && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">{announcements.length} pengumuman</span>
                    <Button variant="primary" size="sm" onClick={startCreate}>
                        <Plus size={14} className="mr-1" /> Tambah
                    </Button>
                </div>
            )}

            {/* List */}
            {announcements.length === 0 && !creating ? (
                <div className="text-center py-12 text-muted">
                    <Megaphone size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Belum ada pengumuman</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {announcements.map((item) => (
                        <div
                            key={item.id}
                            className={`border border-border rounded-lg p-4 flex items-start gap-3 ${
                                item.active ? "bg-surface" : "bg-surface/50 opacity-60"
                            }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-fg truncate">{item.title}</h4>
                                    {!item.active && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-muted/10 text-muted rounded">Draft</span>
                                    )}
                                </div>
                                {item.content && (
                                    <p className="text-xs text-muted mt-1 line-clamp-2">{item.content}</p>
                                )}
                                <p className="text-[10px] text-muted mt-1">
                                    {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => handleToggle(item)}
                                    className="p-1.5 rounded-md hover:bg-bg text-muted hover:text-fg transition-colors"
                                    title={item.active ? "Sembunyikan" : "Tampilkan"}
                                >
                                    {item.active ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button
                                    onClick={() => startEdit(item)}
                                    className="p-1.5 rounded-md hover:bg-bg text-muted hover:text-fg transition-colors"
                                    title="Edit"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 rounded-md hover:bg-bg text-muted hover:text-red-500 transition-colors"
                                    title="Hapus"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
