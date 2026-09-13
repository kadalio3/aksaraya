import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const { chapterId, novelId } = await req.json();

        if (!chapterId || !novelId) {
            return NextResponse.json({ error: "Missing chapterId or novelId" }, { status: 400 });
        }

        // Rate limiting: 1 view per chapter per 24h via cookie
        const cookieStore = await cookies();
        const cookieKey = `viewed_ch_${chapterId}`;
        const alreadyViewed = cookieStore.get(cookieKey);

        if (alreadyViewed) {
            return NextResponse.json({ ok: true, counted: false });
        }

        // Increment both chapter and novel views
        await Promise.all([
            prisma.chapter.update({
                where: { id: chapterId },
                data: { views: { increment: 1 } },
            }),
            prisma.novel.update({
                where: { id: novelId },
                data: { views: { increment: 1 } },
            }),
        ]);

        // Set cookie for 24 hours
        const response = NextResponse.json({ ok: true, counted: true });
        response.cookies.set(cookieKey, "1", {
            maxAge: 60 * 60 * 24, // 24 hours
            httpOnly: true,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("View increment error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
