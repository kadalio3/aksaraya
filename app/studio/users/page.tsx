import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import { UsersClient } from "@/components/studio/users-client";
import prisma from "@/prisma";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

export default async function StudioUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ verify?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    if (params.verify !== STUDIO_ACCESS_TOKEN) {
        notFound();
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    novels: true,
                },
            },
        },
    });

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <UsersClient initialUsers={users} />
        </StudioLayout>
    );
}
