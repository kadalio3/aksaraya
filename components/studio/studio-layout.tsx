import { ReactNode } from "react";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { StudioHeader } from "@/components/studio/studio-header";

interface StudioLayoutProps {
    children: ReactNode;
    studioToken: string;
    user: {
        name: string | null;
        email: string;
        role: string;
    };
}

export function StudioLayout({ children, studioToken, user }: StudioLayoutProps) {
    return (
        <div className="flex h-screen bg-slate-50">
            <StudioSidebar studioToken={studioToken} />

            <main className="flex-1 overflow-y-auto">
                <StudioHeader user={user} />
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
