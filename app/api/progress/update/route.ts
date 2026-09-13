import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { novelId, chapterId, progress } = await req.json();

        if (!novelId || !chapterId || progress === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await prisma.readingProgress.upsert({
            where: {
                userId_novelId: {
                    userId: session.user.id,
                    novelId,
                },
            },
            create: {
                userId: session.user.id,
                novelId,
                chapterId,
                progress: Math.round(progress),
                lastReadAt: new Date(),
            },
            update: {
                chapterId,
                progress: Math.round(progress),
                lastReadAt: new Date(),
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Progress update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
