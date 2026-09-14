import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { hashIP, generateSessionId, getClientIP, getCountry, getCity } from "@/lib/analytics";
import { UAParser } from "ua-parser-js";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { path, referer } = body;

        if (!path) {
            return NextResponse.json({ error: "Path required" }, { status: 400 });
        }

        const headers = new Headers(request.headers);
        const rawIP = getClientIP(headers);
        const userAgentString = headers.get("user-agent") || "";

        // Parse user agent
        const parser = new UAParser(userAgentString);
        const result = parser.getResult();

        // Determine device type
        let device = "Desktop";
        const deviceType = result.device?.type;
        if (deviceType === "mobile") device = "Mobile";
        else if (deviceType === "tablet") device = "Tablet";

        // Browser and OS
        const browser = result.browser?.name || "Unknown";
        const os = result.os?.name || "Unknown";

        // Country & city from headers
        const country = getCountry(headers);
        const city = getCity(headers);

        // Privacy: hash the IP
        const hashedIP = rawIP !== "unknown" ? hashIP(rawIP) : null;

        // Session fingerprint for unique visitor tracking
        const sessionId = rawIP !== "unknown" ? generateSessionId(rawIP, userAgentString) : null;

        // Store the page view
        await prisma.pageView.create({
            data: {
                path,
                ip: hashedIP,
                country,
                city,
                device,
                browser,
                os,
                userAgent: userAgentString.slice(0, 500), // Limit length
                referer: referer?.slice(0, 500) || null,
                sessionId,
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Analytics track error:", error);
        return NextResponse.json({ ok: true }); // Don't fail silently
    }
}
