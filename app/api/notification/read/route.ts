import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, all } = await req.json();

        if (all) {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true },
            });
        } else if (id) {
            // Mark single notification as read
            await prisma.notification.updateMany({
                where: { id, userId: session.user.id },
                data: { isRead: true },
            });
        } else {
            return NextResponse.json({ error: "Provide id or all=true" }, { status: 400 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Notification read error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
