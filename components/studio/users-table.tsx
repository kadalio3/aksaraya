"use client";

import { useState, useMemo } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EditUserModal } from "./edit-user-modal";
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

interface UsersTableProps {
    users: User[];
    onRefresh: () => void;
}

type SortField = "name" | "email" | "role" | "novels" | "createdAt";
type SortDirection = "asc" | "desc";

export function UsersTable({ users, onRefresh }: UsersTableProps) {
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string | null; userName: string }>({
        isOpen: false,
        userId: null,
        userName: "",
    });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; user: User | null }>({
        isOpen: false,
        user: null,
    });
    const { showToast } = useToast();

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    // Filtered and sorted users
    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (user) =>
                    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== "ALL") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortField) {
                case "name":
                    aVal = a.name?.toLowerCase() || "";
                    bVal = b.name?.toLowerCase() || "";
                    break;
                case "email":
                    aVal = a.email.toLowerCase();
                    bVal = b.email.toLowerCase();
                    break;
                case "role":
                    aVal = a.role;
                    bVal = b.role;
                    break;
                case "novels":
                    aVal = a._count.novels;
                    bVal = b._count.novels;
                    break;
                case "createdAt":
                    aVal = new Date(a.createdAt).getTime();
                    bVal = new Date(b.createdAt).getTime();
                    break;
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [users, searchQuery, roleFilter, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete user");
            }

            showToast("User berhasil dihapus", "delete");
            onRefresh();
        } catch (error: any) {
            showToast(error.message || "Gagal menghapus user", "error");
        }
    };

    const handleEdit = (user: User) => {
        setEditModal({ isOpen: true, user });
    };

    const handleEditSuccess = () => {
        showToast("User berhasil diupdate", "success");
        onRefresh();
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return (
            <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
        );
    };

    return (
        <>
            {/* Search and Filter Bar */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Role Filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL">All Roles</option>
                    <option value="USER">USER</option>
                    <option value="TRANSLATOR">TRANSLATOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>

                {/* Results Count */}
                <div className="flex items-center text-sm text-muted px-4">
                    {filteredUsers.length} of {users.length} users
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-bg">
                            <th className="text-left py-3 px-4 font-semibold">User</th>
                            <th
                                className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-bg"
                                onClick={() => handleSort("email")}
                            >
                                Email <SortIcon field="email" />
                            </th>
                            <th
                                className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-bg"
                                onClick={() => handleSort("role")}
                            >
                                Role <SortIcon field="role" />
                            </th>
                            <th
                                className="text-center py-3 px-4 font-semibold cursor-pointer hover:bg-bg"
                                onClick={() => handleSort("novels")}
                            >
                                Novels <SortIcon field="novels" />
                            </th>
                            <th
                                className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-bg"
                                onClick={() => handleSort("createdAt")}
                            >
                                Joined <SortIcon field="createdAt" />
                            </th>
                            <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-muted">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-bg transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {/* Round Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {(user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                                            </div>
                                            {/* Name */}
                                            <div>
                                                <p className="font-medium text-fg">{user.name || "-"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted">{user.email}</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full font-medium ${user.role === "ADMIN"
                                                ? "bg-accent/10 text-fg"
                                                : user.role === "TRANSLATOR"
                                                    ? "bg-accent/10 text-fg"
                                                    : "bg-bg text-fg"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-block px-2 py-1 bg-green-100 text-fg rounded text-sm font-medium">
                                            {user._count.novels}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted">
                                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <IconButton type="edit" onClick={() => handleEdit(user)} />
                                            <IconButton
                                                type="delete"
                                                onClick={() =>
                                                    setDeleteModal({
                                                        isOpen: true,
                                                        userId: user.id,
                                                        userName: user.name || user.email,
                                                    })
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: "" })}
                onConfirm={() => deleteModal.userId && handleDelete(deleteModal.userId)}
                title="Hapus User?"
                message={`Apakah Anda yakin ingin menghapus user "${deleteModal.userName}"? Semua novel dan data terkait akan terhapus. Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
            />

            <EditUserModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, user: null })}
                onSuccess={handleEditSuccess}
                user={editModal.user}
            />
        </>
    );
}
