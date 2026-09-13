import { NextResponse } from "next/server";
import prisma from "@/prisma";

const STUDIO_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token !== STUDIO_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find novels with blob: URLs
    const allNovels = await prisma.novel.findMany({
        select: { id: true, title: true, coverUrl: true },
    });

    const blobNovels = allNovels.filter((n) => n.coverUrl?.startsWith("blob:"));

    // Clean them up
    for (const novel of blobNovels) {
        await prisma.novel.update({
            where: { id: novel.id },
            data: { coverUrl: null },
        });
    }

    return NextResponse.json({
        cleaned: blobNovels.length,
        novels: blobNovels.map((n) => n.title),
    });
}
