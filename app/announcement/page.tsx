import prisma from "@/prisma";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getStudioUrl } from "@/lib/studio";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Megaphone, Calendar } from "lucide-react";

export default async function AnnouncementsListPage() {
    const session = await auth();
    const studioUrl = await getStudioUrl();
    const settings = await getSettings();

    const announcements = await prisma.announcement.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <Navbar user={session?.user} studioUrl={studioUrl} siteName={settings.site_name} />

            <Container className="py-8 flex-1 max-w-3xl">
                <h1 className="text-2xl font-bold text-fg mb-6">Pengumuman</h1>

                {announcements.length === 0 ? (
                    <div className="bg-surface border border-border rounded-xl p-12 text-center">
                        <Megaphone size={32} className="mx-auto mb-3 text-muted opacity-50" />
                        <p className="text-sm text-muted">Belum ada pengumuman.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {announcements.map((a) => (
                            <Link
                                key={a.id}
                                href={`/announcement/${a.id}`}
                                className="block bg-surface border border-border rounded-xl p-5 hover:border-muted transition-colors"
                            >
                                <h2 className="font-semibold text-fg">{a.title}</h2>
                                {a.content && (
                                    <p className="text-sm text-muted mt-1 line-clamp-2">{a.content}</p>
                                )}
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                                    <Calendar size={12} />
                                    {a.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Container>

            <Footer siteName={settings.site_name} />
        </div>
    );
}
