import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";
import { z } from "zod";

const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(5000, "Comment too long"),
    chapterId: z.string(),
    parentId: z.string().nullable().optional(), // For replies
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Check authentication
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = createCommentSchema.parse(body);

        // Check if chapter exists
        const chapter = await prisma.chapter.findUnique({
            where: { id: validatedData.chapterId },
        });

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        // If replying, check if parent comment exists
        let parentComment = null;
        if (validatedData.parentId) {
            parentComment = await prisma.comment.findUnique({
                where: { id: validatedData.parentId },
                select: { id: true, userId: true, content: true },
            });

            if (!parentComment) {
                return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
            }
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content: validatedData.content,
                userId: session.user.id,
                chapterId: validatedData.chapterId,
                parentId: validatedData.parentId || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                        likedBy: true,
                    },
                },
            },
        });

        // Get commenter info for notification messages
        const commenter = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true },
        });
        const commenterName = commenter?.name || commenter?.email || "Seseorang";
        const chapterLink = `/novel/${chapter.novelId}/chapter/${chapter.id}`;

        // Track who has already been notified to prevent duplicates
        const notifiedUserIds = new Set<string>();
        // Never notify the commenter themselves
        notifiedUserIds.add(session.user.id);

        // Send reply notification to parent comment author
        if (parentComment && !notifiedUserIds.has(parentComment.userId)) {
            await prisma.notification.create({
                data: {
                    userId: parentComment.userId,
                    type: "COMMENT_REPLY",
                    title: "Balasan komentar baru",
                    message: `${commenterName} membalas komentar kamu.`,
                    link: chapterLink,
                },
            });
            notifiedUserIds.add(parentComment.userId);
        }

        // Handle @mention notifications for reply-to-reply scenarios
        // When replying to a nested reply, content starts with @username
        const mentionMatch = validatedData.content.match(/^@(\S+)/);
        if (parentComment && mentionMatch) {
            const mentionedName = mentionMatch[1];
            // Find the mentioned user by name (within replies of the parent comment)
            const mentionedUser = await prisma.user.findFirst({
                where: {
                    name: mentionedName,
                    comments: {
                        some: {
                            parentId: validatedData.parentId,
                        },
                    },
                },
                select: { id: true },
            });

            if (mentionedUser && !notifiedUserIds.has(mentionedUser.id)) {
                await prisma.notification.create({
                    data: {
                        userId: mentionedUser.id,
                        type: "COMMENT_REPLY",
                        title: "Balasan komentar baru",
                        message: `${commenterName} membalas komentar kamu.`,
                        link: chapterLink,
                    },
                });
                notifiedUserIds.add(mentionedUser.id);
            }
        }

        // Send notification to novel author when someone comments on their chapter
        const novel = await prisma.novel.findUnique({
            where: { id: chapter.novelId },
            select: { authorId: true, title: true },
        });

        if (novel && !notifiedUserIds.has(novel.authorId)) {
            await prisma.notification.create({
                data: {
                    userId: novel.authorId,
                    type: "COMMENT_REPLY",
                    title: "Komentar baru di novelmu",
                    message: `${commenterName} mengomentari chapter "${chapter.title}" di novel "${novel.title}".`,
                    link: chapterLink,
                },
            });
            notifiedUserIds.add(novel.authorId);
        }

        return NextResponse.json(comment, { status: 201 });
    } catch (error: any) {
        console.error("Create comment error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
