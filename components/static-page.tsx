import prisma from "@/prisma";
import { getSettings } from "@/lib/settings";
import { getStudioUrl } from "@/lib/studio";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StaticPageProps {
    settingKey: string;
    title: string;
    fallback: string;
}

export async function StaticPage({ settingKey, title, fallback }: StaticPageProps) {
    const studioUrl = await getStudioUrl();
    const settings = await getSettings();

    const row = await prisma.siteSetting.findUnique({ where: { key: settingKey } });
    const content = row?.value || fallback;

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <Navbar user={null} studioUrl={studioUrl} siteName={settings.site_name} />

            <Container className="py-8 flex-1 max-w-3xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors mb-6"
                >
                    <ArrowLeft size={14} />
                    Kembali ke Beranda
                </Link>

                <article className="bg-surface border border-border rounded-xl p-6 sm:p-8">
                    <h1 className="text-2xl font-bold text-fg mb-6">{title}</h1>
                    <div className="text-sm text-fg/80 leading-relaxed whitespace-pre-line">
                        {content}
                    </div>
                </article>
            </Container>

            <Footer siteName={settings.site_name} />
        </div>
    );
}


