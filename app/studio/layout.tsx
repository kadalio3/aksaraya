import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { StudioHeader } from "@/components/studio/studio-header";

export default async function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) redirect("/login");
    if (session.user.role !== "ADMIN") notFound();

    // Token is verified by middleware and passed via header
    const headersList = await headers();
    const studioToken = headersList.get("x-studio-token") || "";

    return (
        <div className="flex h-screen bg-bg">
            <StudioSidebar studioToken={studioToken} />

            <main className="flex-1 overflow-y-auto min-w-0">
                <StudioHeader user={session.user} />
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
