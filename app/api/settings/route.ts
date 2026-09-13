import { auth } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";
import { NextRequest, NextResponse } from "next/server";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export async function GET() {
    const settings = await getSettings();
    return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const token = url.searchParams.get("verify");
    if (token !== STUDIO_ACCESS_TOKEN) {
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await request.json();
    await updateSettings(body);

    return NextResponse.json({ success: true });
}
