import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
        }

        // Check if comment exists and user owns it
        const comment = await prisma.comment.findUnique({
            where: { id },
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (comment.userId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only edit your own comments" },
                { status: 403 }
            );
        }

        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id },
            data: { content },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error("Update comment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id },
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Allow owner or admin to delete
        if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "You can only delete your own comments" },
                { status: 403 }
            );
        }

        // Delete comment (cascade will delete replies)
        await prisma.comment.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Delete comment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
