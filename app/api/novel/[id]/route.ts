import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const novel = await prisma.novel.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!novel) {
            return NextResponse.json({ error: "Novel not found" }, { status: 404 });
        }

        // Check if user is the author
        if (novel.authorId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(novel);
    } catch (error) {
        console.error("Get novel error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
