"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/studio/users-table";
import { AddUserModal } from "@/components/studio/add-user-modal";
import { useToast } from "@/components/ui/toast";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
    _count: {
        novels: number;
    };
}

interface UsersClientProps {
    initialUsers: User[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [addModalOpen, setAddModalOpen] = useState(false);

    const handleRefresh = () => {
        router.refresh();
    };

    const handleAddSuccess = () => {
        showToast("User baru berhasil ditambahkan", "success");
        handleRefresh();
    };

    return (
        <>
            {/* Header with Add Button */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">User Management</h1>
                    <p className="text-muted">Manage platform users and roles</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({initialUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <UsersTable users={initialUsers} onRefresh={handleRefresh} />
                </CardContent>
            </Card>

            <AddUserModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />
        </>
    );
}
