import prisma from "@/prisma";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getStudioUrl } from "@/lib/studio";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Container } from "@/components/ui/container";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone, Calendar } from "lucide-react";

export default async function AnnouncementPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();
    const studioUrl = await getStudioUrl();
    const settings = await getSettings();

    const announcement = await prisma.announcement.findUnique({
        where: { id, active: true },
    });

    if (!announcement) notFound();

    // Get other recent announcements for sidebar
    const recentAnnouncements = await prisma.announcement.findMany({
        where: { active: true, id: { not: id } },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <Navbar user={session?.user} studioUrl={studioUrl} siteName={settings.site_name} />

            <Container className="py-8 flex-1">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors mb-6"
                >
                    <ArrowLeft size={14} />
                    Kembali ke Beranda
                </Link>

                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    {/* Main content */}
                    <article className="bg-surface border border-border rounded-xl p-6 sm:p-8">
                        <div className="flex items-start gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                                <Megaphone size={18} className="text-pink-500 dark:text-pink-400" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-fg">
                                    {announcement.title}
                                </h1>
                                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted">
                                    <Calendar size={12} />
                                    {announcement.createdAt.toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                        </div>

                        {announcement.content ? (
                            <div className="prose prose-sm max-w-none text-fg/80 leading-relaxed whitespace-pre-line">
                                {announcement.content}
                            </div>
                        ) : (
                            <p className="text-sm text-muted italic">Tidak ada detail tambahan.</p>
                        )}
                    </article>

                    {/* Sidebar — other announcements */}
                    {recentAnnouncements.length > 0 && (
                        <aside className="hidden lg:block">
                            <h3 className="text-sm font-semibold text-fg mb-3">Pengumuman Lainnya</h3>
                            <div className="space-y-2">
                                {recentAnnouncements.map((a) => (
                                    <Link
                                        key={a.id}
                                        href={`/announcement/${a.id}`}
                                        className="block bg-surface border border-border rounded-lg p-3 hover:border-muted transition-colors"
                                    >
                                        <p className="text-sm font-medium text-fg line-clamp-2">{a.title}</p>
                                        <p className="text-[10px] text-muted mt-1">
                                            {a.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </aside>
                    )}
                </div>
            </Container>

            <Footer siteName={settings.site_name} />
        </div>
    );
}
