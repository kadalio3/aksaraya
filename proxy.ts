import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible proxy without Prisma/database imports
// We'll check authentication status from session cookies
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // CRITICAL: Studio routes require authentication + token verification
    if (pathname.startsWith("/studio")) {
        const sessionToken = request.cookies.get("authjs.session-token") ||
            request.cookies.get("__Secure-authjs.session-token");

        if (!sessionToken) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Verify studio access token
        const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";
        const verifyToken = request.nextUrl.searchParams.get("verify") || "";

        if (verifyToken !== STUDIO_ACCESS_TOKEN) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Pass the verified token via header so layout can read it
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-studio-token", verifyToken);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    // Public paths that don't require authentication
    const publicPaths = [
        "/", "/login", "/register", "/novel",
        "/about", "/contact", "/terms", "/privacy", "/cookies",
        "/announcement", "/search", "/genre", "/tag", "/author",
    ];
    const isPublicPath = publicPaths.some((path) =>
        pathname === path || pathname.startsWith(path + "/")
    ) || (pathname.startsWith("/novel/") && !pathname.includes("/edit") && !pathname.includes("/new"));

    // Check if user has session cookie (simplified auth check for edge)
    const sessionToken = request.cookies.get("authjs.session-token") ||
        request.cookies.get("__Secure-authjs.session-token");

    // Redirect non-authenticated users to login for protected routes
    if (!sessionToken && !isPublicPath && !pathname.startsWith("/api/")) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // For role-based checks, we'll do those in the actual pages
    // since we can't access database in edge runtime
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public files
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
