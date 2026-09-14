import { NextResponse } from "next/server";
import prisma from "@/prisma";

const STUDIO_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

// GET - list all novels with featured status
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token !== STUDIO_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const novels = await prisma.novel.findMany({
        select: {
            id: true,
            title: true,
            coverUrl: true,
            featured: true,
            translator: { select: { name: true } },
            _count: { select: { chapters: true, favorites: true } },
        },
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json(novels);
}

// PUT - toggle featured status
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token !== STUDIO_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, featured } = await request.json();

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const novel = await prisma.novel.update({
        where: { id },
        data: { featured: !!featured },
    });

    return NextResponse.json({ id: novel.id, featured: novel.featured });
}
