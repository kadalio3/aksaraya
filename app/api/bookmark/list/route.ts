import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                chapter: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                    },
                },
                novel: {
                    select: {
                        id: true,
                        title: true,
                        coverUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error("Bookmark list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
