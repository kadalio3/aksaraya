import { SettingsForm } from "@/components/studio/settings-form";
import { getSettings } from "@/lib/settings";

export default async function StudioSettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const params = await searchParams;
    const settings = await getSettings();

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-fg">Settings</h1>
                <p className="text-sm text-muted mt-1">Configure platform settings, SEO, and security</p>
            </div>

            <SettingsForm initialSettings={settings} studioToken={params.verify!} />
        </>
    );
}
