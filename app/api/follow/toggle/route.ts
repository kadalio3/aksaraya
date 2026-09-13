import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { followingId } = await req.json();

        if (!followingId) {
            return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
        }

        if (followingId === session.user.id) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        // Check if already following
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId,
                },
            },
        });

        let isFollowing: boolean;

        if (existing) {
            // Unfollow
            await prisma.follow.delete({
                where: { id: existing.id },
            });
            isFollowing = false;
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId: session.user.id,
                    followingId,
                },
            });

            // Send notification to the followed user
            const follower = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { name: true, email: true },
            });

            await prisma.notification.create({
                data: {
                    userId: followingId,
                    type: "NEW_FOLLOWER",
                    title: "Pengikut baru",
                    message: `${follower?.name || follower?.email} mulai mengikuti kamu.`,
                    link: `/author/${session.user.id}`,
                },
            });

            isFollowing = true;
        }

        // Return updated follower count
        const followersCount = await prisma.follow.count({
            where: { followingId },
        });

        return NextResponse.json({ isFollowing, followersCount });
    } catch (error) {
        console.error("Follow toggle error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
