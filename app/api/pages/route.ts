import { NextResponse } from "next/server";
import prisma from "@/prisma";

const STUDIO_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

const VALID_PAGES = ["page_about", "page_contact", "page_terms", "page_privacy", "page_cookies"];

// GET - get a specific page content
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
        if (!VALID_PAGES.includes(key)) {
            return NextResponse.json({ error: "Invalid page key" }, { status: 400 });
        }
        const row = await prisma.siteSetting.findUnique({ where: { key } });
        return NextResponse.json({ key, value: row?.value || "" });
    }

    // Return all pages
    const rows = await prisma.siteSetting.findMany({
        where: { key: { in: VALID_PAGES } },
    });

    const pages: Record<string, string> = {};
    for (const p of VALID_PAGES) pages[p] = "";
    for (const row of rows) pages[row.key] = row.value;

    return NextResponse.json(pages);
}

// PUT - update page content
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token !== STUDIO_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!VALID_PAGES.includes(key)) {
        return NextResponse.json({ error: "Invalid page key" }, { status: 400 });
    }

    await prisma.siteSetting.upsert({
        where: { key },
        update: { value: value || "" },
        create: { key, value: value || "" },
    });

    return NextResponse.json({ success: true });
}
