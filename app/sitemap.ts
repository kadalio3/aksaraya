export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import prisma from "@/prisma";
import { getSettings } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const settings = await getSettings();
    const baseUrl = settings.site_url || "https://localhost:3000";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/novel`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.3 },
        { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
        { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.2 },
        { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.2 },
    ];

    // Dynamic novel pages
    const novels = await prisma.novel.findMany({
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 500,
    });

    const novelPages: MetadataRoute.Sitemap = novels.map((novel) => ({
        url: `${baseUrl}/novel/${novel.id}`,
        lastModified: novel.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Dynamic chapter pages
    const chapters = await prisma.chapter.findMany({
        where: { isPublished: true },
        select: { id: true, novelId: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 1000,
    });

    const chapterPages: MetadataRoute.Sitemap = chapters.map((ch) => ({
        url: `${baseUrl}/novel/${ch.novelId}/chapter/${ch.id}`,
        lastModified: ch.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    return [...staticPages, ...novelPages, ...chapterPages];
}
