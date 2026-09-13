"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Save, Loader2 } from "lucide-react";

interface PageItem {
    key: string;
    label: string;
    description: string;
}

const PAGES: PageItem[] = [
    { key: "page_about", label: "About Us", description: "Tentang platform ini" },
    { key: "page_contact", label: "Contact Us", description: "Informasi kontak dan cara menghubungi" },
    { key: "page_terms", label: "Terms of Service", description: "Syarat dan ketentuan penggunaan" },
    { key: "page_privacy", label: "Privacy Policy", description: "Kebijakan privasi pengguna" },
    { key: "page_cookies", label: "Cookie Policy", description: "Kebijakan penggunaan cookie" },
];

interface PagesManagerProps {
    studioToken: string;
}

export function PagesManager({ studioToken }: PagesManagerProps) {
    const [pages, setPages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState<string>("page_about");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/pages")
            .then((r) => r.json())
            .then((data) => {
                setPages(data);
                setContent(data["page_about"] || "");
                setLoading(false);
            });
    }, []);

    const switchPage = (key: string) => {
        setActivePage(key);
        setContent(pages[key] || "");
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch(`/api/pages?token=${studioToken}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: activePage, value: content }),
        });
        if (res.ok) {
            setPages({ ...pages, [activePage]: content });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="text-sm text-muted py-8 text-center">Loading...</div>;
    }

    const activePageInfo = PAGES.find((p) => p.key === activePage)!;

    return (
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
            {/* Sidebar tabs */}
            <div className="space-y-1">
                {PAGES.map((page) => (
                    <button
                        key={page.key}
                        onClick={() => switchPage(page.key)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activePage === page.key
                                ? "bg-accent text-accent-fg font-medium"
                                : "text-fg hover:bg-bg"
                        }`}
                    >
                        {page.label}
                    </button>
                ))}
            </div>

            {/* Editor */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                            <FileText size={14} />
                            {activePageInfo.label}
                        </h3>
                        <p className="text-xs text-muted mt-0.5">{activePageInfo.description}</p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <><Loader2 size={14} className="mr-1 animate-spin" /> Menyimpan</>
                        ) : saved ? (
                            "Tersimpan!"
                        ) : (
                            <><Save size={14} className="mr-1" /> Simpan</>
                        )}
                    </Button>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setSaved(false); }}
                    rows={18}
                    placeholder={`Tulis konten ${activePageInfo.label} di sini...\n\nGunakan baris baru untuk paragraf.`}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-fg text-sm leading-relaxed focus:border-accent focus:outline-none resize-none"
                />

                <p className="text-[10px] text-muted">
                    Konten akan ditampilkan di halaman publik sesuai format yang ditulis.
                </p>
            </div>
        </div>
    );
}
