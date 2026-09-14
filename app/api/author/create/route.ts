import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "TRANSLATOR" && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { name, originalLanguage, description } = await request.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Author name is required" }, { status: 400 });
        }

        // Check if author already exists
        const existing = await prisma.author.findFirst({
            where: { name: name.trim() },
        });

        if (existing) {
            return NextResponse.json(existing);
        }

        const author = await prisma.author.create({
            data: {
                name: name.trim(),
                originalLanguage: originalLanguage?.trim() || null,
                description: description?.trim() || null,
            },
        });

        return NextResponse.json(author, { status: 201 });
    } catch (error) {
        console.error("Create author error:", error);
        return NextResponse.json({ error: "Failed to create author" }, { status: 500 });
    }
}
