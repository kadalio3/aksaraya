import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";
import { z } from "zod";

const ratingSchema = z.object({
    novelId: z.string(),
    rating: z.number().min(1).max(5),
    review: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Check authentication
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = ratingSchema.parse(body);

        // Check if novel exists
        const novel = await prisma.novel.findUnique({
            where: { id: validatedData.novelId },
        });

        if (!novel) {
            return NextResponse.json({ error: "Novel not found" }, { status: 404 });
        }

        // Upsert rating (create or update if exists)
        const rating = await prisma.rating.upsert({
            where: {
                userId_novelId: {
                    userId: session.user.id,
                    novelId: validatedData.novelId,
                },
            },
            create: {
                userId: session.user.id,
                novelId: validatedData.novelId,
                rating: validatedData.rating,
                review: validatedData.review || null,
            },
            update: {
                rating: validatedData.rating,
                review: validatedData.review || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update novel's average rating and total count
        const allRatings = await prisma.rating.findMany({
            where: { novelId: validatedData.novelId },
            select: { rating: true },
        });

        const averageRating =
            allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

        await prisma.novel.update({
            where: { id: validatedData.novelId },
            data: {
                averageRating: averageRating,
                totalRatings: allRatings.length,
            },
        });

        return NextResponse.json(rating);
    } catch (error: any) {
        console.error("Create rating error:", error);

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
