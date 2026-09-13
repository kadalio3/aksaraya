"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-fg mb-3">
                    Terjadi Kesalahan
                </h1>
                <p className="text-muted mb-8">
                    Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Button variant="primary" onClick={() => reset()}>
                        Coba Lagi
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = "/"}>
                        Kembali ke Beranda
                    </Button>
                </div>
            </div>
        </div>
    );
}
