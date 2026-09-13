export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
    const settings = await getSettings();
    const baseUrl = settings.site_url || "https://localhost:3000";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/dashboard/",
                    "/studio/",
                    "/login",
                    "/register",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
