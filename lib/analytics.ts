import { createHash } from "crypto";

/**
 * Hash an IP address for privacy (SHA-256, irreversible)
 */
export function hashIP(ip: string): string {
    return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Generate a session fingerprint from IP + User-Agent + date
 * This identifies unique visitors without cookies
 */
export function generateSessionId(ip: string, userAgent: string): string {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const raw = `${ip}-${userAgent}-${date}`;
    return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

/**
 * Extract real IP from request headers
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        headers.get("cf-connecting-ip") ||
        "unknown"
    );
}

/**
 * Get country from platform-specific headers
 */
export function getCountry(headers: Headers): string | null {
    return (
        headers.get("x-vercel-ip-country") ||
        headers.get("cf-ipcountry") ||
        null
    );
}

/**
 * Get city from platform-specific headers
 */
export function getCity(headers: Headers): string | null {
    return (
        headers.get("x-vercel-ip-city") ||
        null
    );
}
