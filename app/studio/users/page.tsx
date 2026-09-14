import { UsersClient } from "@/components/studio/users-client";
import prisma from "@/prisma";

export default async function StudioUsersPage() {
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

    return <UsersClient initialUsers={users} />;
}
