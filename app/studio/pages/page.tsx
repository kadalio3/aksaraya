import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { PagesManager } from "@/components/studio/pages-manager";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioPagesPage({
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
                <h1 className="text-2xl font-bold font-display text-fg">Halaman</h1>
                <p className="text-sm text-muted mt-1">Kelola konten halaman statis (About, Terms, Privacy, dll)</p>
            </div>

            <PagesManager studioToken={params.verify!} />
        </StudioLayout>
    );
}
