import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudioLayout } from "@/components/studio/studio-layout";
import prisma from "@/prisma";
import Link from "next/link";
import { Users, PenTool, BookOpen, FileText } from "lucide-react";

const STUDIO_ACCESS_TOKEN = process.env.ADMIN_STUDIO_TOKEN || "nhub-studio-2024-secure";

interface SearchParams {
    verify?: string;
}

export default async function StudioPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user) redirect("/login");
    if (session.user.role !== "ADMIN") notFound();
    if (params.verify !== STUDIO_ACCESS_TOKEN) notFound();

    // Sequential queries to avoid pool exhaustion
    const totalUsers = await prisma.user.count();
    const totalNovels = await prisma.novel.count();
    const totalChapters = await prisma.chapter.count();
    const totalAuthors = await prisma.user.count({ where: { role: "AUTHOR" } });

    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const stats = [
        { label: "Users", value: totalUsers, icon: Users },
        { label: "Authors", value: totalAuthors, icon: PenTool },
        { label: "Novels", value: totalNovels, icon: BookOpen },
        { label: "Chapters", value: totalChapters, icon: FileText },
    ];

    return (
        <StudioLayout studioToken={params.verify} user={session.user}>
            <div className="mb-8">
                <h1 className="text-2xl font-bold font-display text-fg">Dashboard</h1>
                <p className="text-sm text-muted mt-1">Platform overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-surface border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 text-muted mb-2">
                                <Icon size={16} />
                                <span className="text-xs font-medium">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-fg">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Users + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-fg mb-4">Recent Registrations</h2>
                    <div className="space-y-2">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between py-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-fg truncate">{user.name || "Unnamed"}</p>
                                    <p className="text-xs text-muted truncate">{user.email}</p>
                                </div>
                                <span className="text-xs text-muted font-medium px-2 py-0.5 bg-muted/10 rounded-md shrink-0">
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-fg mb-4">Quick Actions</h2>
                    <div className="space-y-1">
                        {[
                            { label: "Manage Users", icon: Users, href: `/studio/users?verify=${params.verify}` },
                            { label: "Review Novels", icon: BookOpen, href: `/studio/content?verify=${params.verify}` },
                            { label: "Manage Categories", icon: FileText, href: `/studio/categories?verify=${params.verify}` },
                            { label: "View Reports", icon: FileText, href: `/studio/reports?verify=${params.verify}` },
                        ].map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-fg hover:bg-bg transition-[background-color] duration-300"
                                >
                                    <Icon size={16} className="text-muted" />
                                    <span>{action.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </StudioLayout>
    );
}
