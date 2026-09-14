import { FeaturedManager } from "@/components/studio/featured-manager";

export default async function StudioFeaturedPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const params = await searchParams;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Featured Novels</h1>
                <p className="text-sm text-muted mt-1">Pilih novel yang ditampilkan di hero carousel homepage (maks 6)</p>
            </div>

            <FeaturedManager studioToken={params.verify!} />
        </>
    );
}
