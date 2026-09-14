import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const novelId = searchParams.get("id");

        if (!novelId) {
            return NextResponse.json(
                { message: "Novel ID is required" },
                { status: 400 }
            );
        }

        // Check if novel exists and user is the owner
        const existingNovel = await prisma.novel.findUnique({
            where: { id: novelId },
        });

        if (!existingNovel) {
            return NextResponse.json(
                { message: "Novel not found" },
                { status: 404 }
            );
        }

        // Check ownership (or admin)
        if (
            existingNovel.translatorId !== session.user.id &&
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                { message: "You don't have permission to delete this novel" },
                { status: 403 }
            );
        }

        // Delete novel (cascade will delete chapters, favorites, etc.)
        await prisma.novel.delete({
            where: { id: novelId },
        });

        return NextResponse.json(
            { message: "Novel deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Delete novel error:", error);

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
