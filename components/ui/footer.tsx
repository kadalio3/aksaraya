import Link from "next/link";

interface FooterProps {
    siteName?: string;
}

export function Footer({
    siteName = "NovelHub",
}: FooterProps) {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-surface border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Links row */}
                <div className="py-6 flex flex-wrap items-center justify-center gap-6 text-sm">
                    <Link href="/about" className="text-muted hover:text-fg transition-colors">
                        Tentang Kami
                    </Link>
                    <Link href="/contact" className="text-muted hover:text-fg transition-colors">
                        Hubungi Kami
                    </Link>
                    <Link href="/announcement" className="text-muted hover:text-fg transition-colors">
                        Pengumuman
                    </Link>
                </div>

                {/* Copyright + policy links */}
                <div className="py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted">
                        &copy; {year} {siteName}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                        <Link href="/terms" className="text-muted hover:text-fg transition-colors">
                            Syarat & Ketentuan
                        </Link>
                        <span className="text-border">·</span>
                        <Link href="/privacy" className="text-muted hover:text-fg transition-colors">
                            Kebijakan Privasi
                        </Link>
                        <span className="text-border">·</span>
                        <Link href="/cookies" className="text-muted hover:text-fg transition-colors">
                            Kebijakan Cookie
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
