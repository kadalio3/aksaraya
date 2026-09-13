import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleFavoriteSchema } from "@/lib/validators";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = toggleFavoriteSchema.parse(body);

        // Check if novel exists
        const novel = await prisma.novel.findUnique({
            where: { id: validatedData.novelId },
        });

        if (!novel) {
            return NextResponse.json({ message: "Novel not found" }, { status: 404 });
        }

        // Check if already favorited
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_novelId: {
                    userId: session.user.id,
                    novelId: validatedData.novelId,
                },
            },
        });

        if (existingFavorite) {
            // Remove from favorites
            await prisma.favorite.delete({
                where: { id: existingFavorite.id },
            });
            return NextResponse.json({ message: "Removed from favorites", favorited: false });
        } else {
            // Add to favorites
            await prisma.favorite.create({
                data: {
                    userId: session.user.id,
                    novelId: validatedData.novelId,
                },
            });
            return NextResponse.json({ message: "Added to favorites", favorited: true });
        }
    } catch (error: any) {
        console.error("Toggle favorite error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: "Invalid data", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
