import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { FeaturedManager } from "@/components/studio/featured-manager";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioFeaturedPage({
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
                <h1 className="text-2xl font-bold font-display text-fg">Featured Novels</h1>
                <p className="text-sm text-muted mt-1">Pilih novel yang ditampilkan di hero carousel homepage (maks 6)</p>
            </div>

            <FeaturedManager studioToken={params.verify!} />
        </StudioLayout>
    );
}
