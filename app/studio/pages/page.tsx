import { PagesManager } from "@/components/studio/pages-manager";

export default async function StudioPagesPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const params = await searchParams;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Halaman</h1>
                <p className="text-sm text-muted mt-1">Kelola konten halaman statis (About, Terms, Privacy, dll)</p>
            </div>

            <PagesManager studioToken={params.verify!} />
        </>
    );
}
