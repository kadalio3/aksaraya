import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createNovelSchema } from "@/lib/validators";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is TRANSLATOR or ADMIN
        if (session.user.role !== "TRANSLATOR" && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Only translators can create novels" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = createNovelSchema.parse(body);

        // Create novel - genres and tags are already strings
        const novel = await prisma.novel.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                coverUrl: validatedData.coverUrl || null,
                genres: validatedData.genres,
                tags: validatedData.tags || "",
                translatorId: session.user.id,
                authorId: validatedData.authorId || null,
            },
            include: {
                translator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                author: true,
            },
        });

        return NextResponse.json(novel, { status: 201 });
    } catch (error: any) {
        console.error("Create novel error:", error);

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
