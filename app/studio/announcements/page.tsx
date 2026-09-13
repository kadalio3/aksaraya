import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { AnnouncementManager } from "@/components/studio/announcement-manager";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioAnnouncementsPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
    if (params.verify !== STUDIO_ACCESS_TOKEN) notFound();

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Pengumuman</h1>
                <p className="text-sm text-muted mt-1">Kelola pengumuman yang tampil di homepage</p>
            </div>

            <AnnouncementManager studioToken={params.verify!} />
        </StudioLayout>
    );
}
