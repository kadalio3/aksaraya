import prisma from "@/prisma";

/**
 * Verify if user owns a novel or is an admin
 */
export async function verifyNovelOwnership(
    userId: string,
    novelId: string,
    userRole?: string
): Promise<{ authorized: boolean; novel?: any; error?: string }> {
    try {
        const novel = await prisma.novel.findUnique({
            where: { id: novelId },
            select: {
                id: true,
                authorId: true,
                title: true,
            },
        });

        if (!novel) {
            return { authorized: false, error: "Novel not found" };
        }

        // Admin can access any novel
        if (userRole === "ADMIN") {
            return { authorized: true, novel };
        }

        // Check if user is the author
        if (novel.authorId === userId) {
            return { authorized: true, novel };
        }

        return { authorized: false, error: "Unauthorized: You don't own this novel" };
    } catch (error) {
        console.error("Error verifying novel ownership:", error);
        return { authorized: false, error: "Internal server error" };
    }
}

/**
 * Verify if user owns a chapter (via parent novel) or is an admin
 */
export async function verifyChapterOwnership(
    userId: string,
    chapterId: string,
    userRole?: string
): Promise<{ authorized: boolean; chapter?: any; error?: string }> {
    try {
        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: {
                novel: {
                    select: {
                        id: true,
                        authorId: true,
                        title: true,
                    },
                },
            },
        });

        if (!chapter) {
            return { authorized: false, error: "Chapter not found" };
        }

        // Admin can access any chapter
        if (userRole === "ADMIN") {
            return { authorized: true, chapter };
        }

        // Check if user owns the parent novel
        if (chapter.novel.authorId === userId) {
            return { authorized: true, chapter };
        }

        return { authorized: false, error: "Unauthorized: You don't own this chapter" };
    } catch (error) {
        console.error("Error verifying chapter ownership:", error);
        return { authorized: false, error: "Internal server error" };
    }
}

/**
 * Verify if user is an admin
 */
export function isAdmin(role?: string): boolean {
    return role === "ADMIN";
}

/**
 * Verify if user is an author or admin
 */
export function isAuthorOrAdmin(role?: string): boolean {
    return role === "AUTHOR" || role === "ADMIN";
}
