import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateNovelSchema } from "@/lib/validators";
import prisma from "@/prisma";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validatedData = updateNovelSchema.parse(body);

        // Check if novel exists and user is the owner
        const existingNovel = await prisma.novel.findUnique({
            where: { id: validatedData.id },
        });

        if (!existingNovel) {
            return NextResponse.json(
                { error: "Novel not found" },
                { status: 404 }
            );
        }

        // Check ownership (or admin)
        if (
            existingNovel.translatorId !== session.user.id &&
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                { error: "You don't have permission to edit this novel" },
                { status: 403 }
            );
        }

        // Update novel - genres and tags are already strings
        const updateData: any = {};
        if (validatedData.title) updateData.title = validatedData.title;
        if (validatedData.description) updateData.description = validatedData.description;
        if (validatedData.coverUrl !== undefined) updateData.coverUrl = validatedData.coverUrl || null;
        if (validatedData.genres) updateData.genres = validatedData.genres;
        if (validatedData.tags) updateData.tags = validatedData.tags;
        if (validatedData.authorId !== undefined) updateData.authorId = validatedData.authorId || null;

        const novel = await prisma.novel.update({
            where: { id: validatedData.id },
            data: updateData,
            include: {
                translator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(novel, { status: 200 });
    } catch (error: any) {
        console.error("Update novel error:", error);

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
