import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { chapterId, novelId } = await req.json();

        if (!chapterId || !novelId) {
            return NextResponse.json({ error: "Missing chapterId or novelId" }, { status: 400 });
        }

        // Check if bookmark already exists
        const existing = await prisma.bookmark.findUnique({
            where: {
                userId_chapterId: {
                    userId: session.user.id,
                    chapterId,
                },
            },
        });

        let isBookmarked: boolean;

        if (existing) {
            await prisma.bookmark.delete({ where: { id: existing.id } });
            isBookmarked = false;
        } else {
            await prisma.bookmark.create({
                data: {
                    userId: session.user.id,
                    chapterId,
                    novelId,
                },
            });
            isBookmarked = true;
        }

        return NextResponse.json({ isBookmarked });
    } catch (error) {
        console.error("Bookmark toggle error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
