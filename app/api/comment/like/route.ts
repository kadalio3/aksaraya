import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Check authentication
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { commentId } = await req.json();

        if (!commentId) {
            return NextResponse.json(
                { error: "Comment ID is required" },
                { status: 400 }
            );
        }

        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Check if user already liked
        const existingLike = await prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: session.user.id,
                    commentId,
                },
            },
        });

        if (existingLike) {
            // Unlike - remove like and decrement count
            await prisma.$transaction([
                prisma.commentLike.delete({
                    where: { id: existingLike.id },
                }),
                prisma.comment.update({
                    where: { id: commentId },
                    data: {
                        likes: {
                            decrement: 1,
                        },
                    },
                }),
            ]);

            return NextResponse.json({ liked: false, likes: comment.likes - 1 });
        } else {
            // Like - add like and increment count
            await prisma.$transaction([
                prisma.commentLike.create({
                    data: {
                        userId: session.user.id,
                        commentId,
                    },
                }),
                prisma.comment.update({
                    where: { id: commentId },
                    data: {
                        likes: {
                            increment: 1,
                        },
                    },
                }),
            ]);

            return NextResponse.json({ liked: true, likes: comment.likes + 1 });
        }
    } catch (error) {
        console.error("Like comment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
