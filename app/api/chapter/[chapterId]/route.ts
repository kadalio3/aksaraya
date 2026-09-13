import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chapterId: string }> }
) {
    try {
        const { chapterId } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: {
                novel: {
                    select: {
                        id: true,
                        authorId: true,
                    },
                },
            },
        });

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        // Check if user is the author or admin
        if (chapter.novel.authorId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("Get chapter error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
