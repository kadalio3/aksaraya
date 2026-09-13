import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const chapterId = searchParams.get("chapterId");
        const sort = searchParams.get("sort") || "latest"; // latest, top, oldest
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 50;
        const skip = (page - 1) * limit;

        if (!chapterId) {
            return NextResponse.json(
                { error: "Chapter ID is required" },
                { status: 400 }
            );
        }

        // Build orderBy
        let orderBy: any = { createdAt: "desc" };
        if (sort === "top") {
            orderBy = { likes: "desc" };
        } else if (sort === "oldest") {
            orderBy = { createdAt: "asc" };
        }

        // Fetch only top-level comments (no parentId)
        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: {
                    chapterId,
                    parentId: null, // Only top-level comments
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
                    replies: {
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
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                    _count: {
                        select: {
                            replies: true,
                            likedBy: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.comment.count({
                where: {
                    chapterId,
                    parentId: null,
                },
            }),
        ]);

        return NextResponse.json({
            comments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("List comments error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
