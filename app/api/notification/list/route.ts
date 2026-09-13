import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.notification.count({
                where: { userId: session.user.id },
            }),
            prisma.notification.count({
                where: { userId: session.user.id, isRead: false },
            }),
        ]);

        return NextResponse.json({ notifications, total, unreadCount });
    } catch (error) {
        console.error("Notification list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
