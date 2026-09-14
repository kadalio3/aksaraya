import { AnnouncementManager } from "@/components/studio/announcement-manager";

export default async function StudioAnnouncementsPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const params = await searchParams;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Pengumuman</h1>
                <p className="text-sm text-muted mt-1">Kelola pengumuman yang tampil di homepage</p>
            </div>

            <AnnouncementManager studioToken={params.verify!} />
        </>
    );
}
