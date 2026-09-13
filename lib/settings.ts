import prisma from "@/prisma";

export interface SiteSettings {
    // General
    site_name: string;
    site_description: string;
    contact_email: string;
    // SEO
    site_url: string;
    meta_keywords: string;
    og_image: string;
    google_analytics_id: string;
    // Security
    allow_registration: string;
    require_email_verification: string;
    enable_content_moderation: string;
    default_user_role: string;
    maintenance_mode: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
    // General
    site_name: "NovelHub",
    site_description: "Platform Baca & Tulis Novel Terbaik",
    contact_email: "admin@novelhub.com",
    // SEO
    site_url: "",
    meta_keywords: "novel, webnovel, baca novel, tulis novel, novel online",
    og_image: "",
    google_analytics_id: "",
    // Security
    allow_registration: "true",
    require_email_verification: "false",
    enable_content_moderation: "true",
    default_user_role: "USER",
    maintenance_mode: "false",
};

let cachedSettings: SiteSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export async function getSettings(): Promise<SiteSettings> {
    const now = Date.now();
    if (cachedSettings && now - cacheTime < CACHE_TTL) {
        return cachedSettings;
    }

    const rows = await prisma.siteSetting.findMany();
    const fromDb: Record<string, string> = {};
    for (const row of rows) {
        fromDb[row.key] = row.value;
    }

    cachedSettings = { ...DEFAULT_SETTINGS, ...fromDb };
    cacheTime = now;
    return cachedSettings;
}

export async function getSetting(key: keyof SiteSettings): Promise<string> {
    const settings = await getSettings();
    return settings[key];
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<void> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    for (const [key, value] of entries) {
        await prisma.siteSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
        });
    }

    // Invalidate cache
    cachedSettings = null;
    cacheTime = 0;
}

export function isEnabled(value: string): boolean {
    return value === "true";
}
