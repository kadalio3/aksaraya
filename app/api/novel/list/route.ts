import { NextRequest, NextResponse } from "next/server";
import { novelSearchSchema } from "@/lib/validators";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const query = searchParams.get("query") || "";
        const genre = searchParams.get("genre") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // Validate query params
        const validatedParams = novelSearchSchema.parse({
            query,
            genre,
            page,
            limit,
        });

        const skip = (validatedParams.page - 1) * validatedParams.limit;

        // Build where clause
        const where: any = {};

        if (validatedParams.query) {
            where.OR = [
                { title: { contains: validatedParams.query } },
                { description: { contains: validatedParams.query } },
            ];
        }

        if (validatedParams.genre) {
            where.genres = { contains: validatedParams.genre };
        }

        // Fetch novels with pagination
        const [novels, total] = await Promise.all([
            prisma.novel.findMany({
                where,
                skip,
                take: validatedParams.limit,
                include: {
                    translator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            chapters: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: "desc",
                },
            }),
            prisma.novel.count({ where }),
        ]);

        return NextResponse.json({
            novels,
            pagination: {
                page: validatedParams.page,
                limit: validatedParams.limit,
                total,
                totalPages: Math.ceil(total / validatedParams.limit),
            },
        });
    } catch (error: any) {
        console.error("List novels error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
