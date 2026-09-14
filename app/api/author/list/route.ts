import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET() {
    try {
        const authors = await prisma.author.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                originalLanguage: true,
            },
        });

        return NextResponse.json(authors);
    } catch (error) {
        console.error("List authors error:", error);
        return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
    }
}
