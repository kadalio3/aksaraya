import { auth } from "@/lib/auth";

const STUDIO_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export async function getStudioUrl() {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
        return null;
    }

    return `/studio?verify=${STUDIO_TOKEN}`;
}
