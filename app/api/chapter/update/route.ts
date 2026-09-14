import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateChapterSchema } from "@/lib/validators";
import prisma from "@/prisma";

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = updateChapterSchema.parse(body);

        // Check if chapter exists
        const existingChapter = await prisma.chapter.findUnique({
            where: { id: validatedData.id },
            include: { novel: { select: { id: true, translatorId: true, title: true } } },
        });

        if (!existingChapter) {
            return NextResponse.json({ message: "Chapter not found" }, { status: 404 });
        }

        // Check ownership
        if (
            existingChapter.novel.translatorId !== session.user.id &&
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                { message: "You don't have permission to edit this chapter" },
                { status: 403 }
            );
        }

        // Build update data
        const updateData: any = {};
        if (validatedData.title) updateData.title = validatedData.title;
        if (validatedData.content) {
            updateData.content = validatedData.content;
            updateData.wordCount = countWords(validatedData.content);
        }
        if (validatedData.order !== undefined) updateData.order = validatedData.order;

        const wasPublished = existingChapter.isPublished;
        if (validatedData.isPublished !== undefined) {
            updateData.isPublished = validatedData.isPublished;
            // Set publishedAt if publishing for the first time
            if (validatedData.isPublished && !existingChapter.publishedAt) {
                updateData.publishedAt = new Date();
            }
        }

        // Update chapter
        const chapter = await prisma.chapter.update({
            where: { id: validatedData.id },
            data: updateData,
        });

        // Send notifications if this chapter is being published for the first time
        const justPublished = !wasPublished && validatedData.isPublished === true;
        if (justPublished) {
            const novel = existingChapter.novel;

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
                        message: `Chapter ${chapter.order}: "${chapter.title}" telah dipublish di novel "${novel.title}".`,
                        link: `/novel/${novel.id}/chapter/${chapter.id}`,
                    })),
                    skipDuplicates: true,
                });
            }
        }

        return NextResponse.json(
            { message: "Chapter updated successfully", chapter },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Update chapter error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: "Invalid data", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
