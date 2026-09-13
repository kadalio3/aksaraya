import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const novelId = searchParams.get("novelId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;
        const skip = (page - 1) * limit;

        if (!novelId) {
            return NextResponse.json(
                { error: "Novel ID is required" },
                { status: 400 }
            );
        }

        const [ratings, total] = await Promise.all([
            prisma.rating.findMany({
                where: { novelId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.rating.count({ where: { novelId } }),
        ]);

        // Calculate rating breakdown
        const breakdown = await prisma.rating.groupBy({
            by: ["rating"],
            where: { novelId },
            _count: true,
        });

        const ratingBreakdown = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        breakdown.forEach((item) => {
            ratingBreakdown[item.rating as keyof typeof ratingBreakdown] = item._count;
        });

        return NextResponse.json({
            ratings,
            breakdown: ratingBreakdown,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("List ratings error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
