"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Upload, X, ImageIcon } from "lucide-react";

interface CoverUploaderProps {
    currentCoverUrl?: string | null;
    onCoverChange: (url: string) => void;
}

export function CoverUploader({ currentCoverUrl, onCoverChange }: CoverUploaderProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Pilih file gambar (JPG, PNG, WebP)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Ukuran gambar maksimal 5MB");
            return;
        }

        setError("");
        setUploading(true);

        try {
            // Show local preview immediately
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Upload to server
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload gagal");
            }

            const { url } = await res.json();

            // Clean up blob URL and use real URL
            URL.revokeObjectURL(objectUrl);
            setPreviewUrl(url);
            onCoverChange(url);
        } catch (err: any) {
            setError(err.message || "Gagal upload gambar");
            setPreviewUrl(currentCoverUrl || null);
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onCoverChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                    {previewUrl ? (
                        <div className="relative group">
                            <div className="w-48 h-64 bg-bg rounded-lg overflow-hidden border-2 border-border">
                                <Image
                                    src={previewUrl}
                                    alt="Cover preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Remove cover"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-48 h-64 bg-bg rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                            <div className="text-center p-4">
                                <ImageIcon size={32} className="mx-auto mb-2 text-muted" />
                                <p className="text-sm text-muted">No cover</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                    <h3 className="font-semibold mb-2 text-fg">Cover Image</h3>
                    <p className="text-sm text-muted mb-4">
                        Upload cover novel. Ukuran rekomendasi: 600x800px (rasio 3:4)
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />

                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <Upload size={14} className="mr-1.5" />
                            {uploading ? "Uploading..." : previewUrl ? "Ganti Cover" : "Upload Cover"}
                        </Button>

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <div className="text-xs text-muted space-y-1">
                            <p>• Format: JPG, PNG, WebP</p>
                            <p>• Maksimal: 5MB</p>
                            <p>• Rekomendasi: 600x800px (rasio 3:4)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
