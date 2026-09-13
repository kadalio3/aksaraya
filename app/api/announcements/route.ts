import { NextResponse } from "next/server";
import prisma from "@/prisma";

const STUDIO_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

// GET - fetch all announcements (public for homepage, all for studio)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const announcements = await prisma.announcement.findMany({
        where: activeOnly ? { active: true } : {},
        orderBy: { createdAt: "desc" },
        take: activeOnly ? 10 : 50,
    });

    return NextResponse.json(announcements);
}

// POST - create announcement (admin only)
export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token !== STUDIO_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, active } = body;

    if (!title?.trim()) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
        data: {
            title: title.trim(),
            content: content?.trim() || null,
            active: active ?? true,
        },
    });

    return NextResponse.json(announcement, { status: 201 });
}

// PUT - update announcement (admin only)
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token !== STUDIO_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, active } = body;

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.update({
        where: { id },
        data: {
            ...(title !== undefined && { title: title.trim() }),
            ...(content !== undefined && { content: content?.trim() || null }),
            ...(active !== undefined && { active }),
        },
    });

    return NextResponse.json(announcement);
}

// DELETE - delete announcement (admin only)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (token !== STUDIO_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
