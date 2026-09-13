import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(req.url);
        const followingId = searchParams.get("followingId");

        if (!followingId) {
            return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
        }

        const followersCount = await prisma.follow.count({
            where: { followingId },
        });

        if (!session?.user) {
            return NextResponse.json({ isFollowing: false, followersCount });
        }

        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId,
                },
            },
        });

        return NextResponse.json({ isFollowing: !!existing, followersCount });
    } catch (error) {
        console.error("Follow status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
