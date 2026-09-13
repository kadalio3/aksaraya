import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const chapterId = searchParams.get("id");

        if (!chapterId) {
            return NextResponse.json({ message: "Chapter ID is required" }, { status: 400 });
        }

        // Check if chapter exists
        const existingChapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { novel: true },
        });

        if (!existingChapter) {
            return NextResponse.json({ message: "Chapter not found" }, { status: 404 });
        }

        // Check ownership
        if (
            existingChapter.novel.authorId !== session.user.id &&
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                { message: "You don't have permission to delete this chapter" },
                { status: 403 }
            );
        }

        // Delete chapter
        await prisma.chapter.delete({
            where: { id: chapterId },
        });

        return NextResponse.json({ message: "Chapter deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Delete chapter error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
