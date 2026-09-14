import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createChapterSchema } from "@/lib/validators";
import prisma from "@/prisma";

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = createChapterSchema.parse(body);

        // Check if novel exists and user is the owner
        const novel = await prisma.novel.findUnique({
            where: { id: validatedData.novelId },
            select: { id: true, translatorId: true, title: true },
        });

        if (!novel) {
            return NextResponse.json({ message: "Novel not found" }, { status: 404 });
        }

        if (novel.translatorId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "You don't have permission to add chapters to this novel" },
                { status: 403 }
            );
        }

        // Get next chapter order if not provided
        let order = validatedData.order;
        if (!order) {
            const lastChapter = await prisma.chapter.findFirst({
                where: { novelId: validatedData.novelId },
                orderBy: { order: "desc" },
            });
            order = (lastChapter?.order || 0) + 1;
        }

        const wordCount = countWords(validatedData.content);

        // Create chapter
        const chapter = await prisma.chapter.create({
            data: {
                novelId: validatedData.novelId,
                title: validatedData.title,
                content: validatedData.content,
                order,
                isPublished: validatedData.isPublished,
                publishedAt: validatedData.isPublished ? new Date() : null,
                wordCount,
            },
        });

        // Send notifications if chapter is published
        if (validatedData.isPublished) {
            // Get users who favorited this novel OR follow this author
            const [favoriters, followers] = await Promise.all([
                prisma.favorite.findMany({
                    where: { novelId: novel.id },
                    select: { userId: true },
                }),
                prisma.follow.findMany({
                    where: { followingId: novel.translatorId },
                    select: { followerId: true },
                }),
            ]);

            // Merge unique user IDs, exclude the author themselves
            const notifyUserIds = [
                ...new Set([
                    ...favoriters.map((f) => f.userId),
                    ...followers.map((f) => f.followerId),
                ]),
            ].filter((uid) => uid !== novel.translatorId);

            if (notifyUserIds.length > 0) {
                await prisma.notification.createMany({
                    data: notifyUserIds.map((userId) => ({
                        userId,
                        type: "NEW_CHAPTER" as const,
                        title: "Chapter baru tersedia",
                        message: `Chapter ${order}: "${validatedData.title}" telah dipublish di novel "${novel.title}".`,
                        link: `/novel/${novel.id}/chapter/${chapter.id}`,
                    })),
                    skipDuplicates: true,
                });
            }
        }

        return NextResponse.json(
            { message: "Chapter created successfully", chapter },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create chapter error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: "Invalid data", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
