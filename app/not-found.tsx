import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-8xl font-bold font-display text-accent/20 mb-4">404</div>
                <h1 className="text-2xl font-bold text-fg mb-3">
                    Halaman Tidak Ditemukan
                </h1>
                <p className="text-muted mb-8">
                    Halaman yang kamu cari tidak ada atau sudah dipindahkan.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/">
                        <Button variant="primary">Kembali ke Beranda</Button>
                    </Link>
                    <Link href="/novel">
                        <Button variant="outline">Jelajahi Novel</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
