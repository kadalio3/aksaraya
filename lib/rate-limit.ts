// Rate Limiter - Simple in-memory implementation
// For production, use Redis or similar

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const rateLimitStore: RateLimitStore = {};

export function rateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const record = rateLimitStore[identifier];

    // Clean expired records periodically
    if (Math.random() < 0.01) {
        Object.keys(rateLimitStore).forEach((key) => {
            if (rateLimitStore[key].resetTime < now) {
                delete rateLimitStore[key];
            }
        });
    }

    // No record or expired record
    if (!record || record.resetTime < now) {
        rateLimitStore[identifier] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return { allowed: true };
    }

    // Increment count
    record.count++;

    // Check if exceeded
    if (record.count > maxAttempts) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
    }

    return { allowed: true };
}

// Get client IP from request
export function getClientIp(request: Request): string {
    // Check common headers for real IP (behind proxies)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    return "unknown";
}

// Validate email domain (block disposable emails)
const disposableEmailDomains = [
    "tempmail.com",
    "guerrillamail.com",
    "10minutemail.com",
    "throwaway.email",
    "mailinator.com",
    "trashmail.com",
    "fakeinbox.com",
    "yopmail.com",
    "maildrop.cc",
    "discard.email",
];

export function isDisposableEmail(email: string): boolean {
    const domain = email.split("@")[1]?.toLowerCase();
    return disposableEmailDomains.includes(domain);
}

// Simple honeypot field check
export function detectHoneypot(body: any): boolean {
    // If there's a hidden field that bots might fill
    return !!body.website || !!body.url || !!body.phone;
}
