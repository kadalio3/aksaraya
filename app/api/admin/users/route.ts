import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(["USER", "AUTHOR", "ADMIN"]).optional(),
});

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        // Check authentication
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only ADMIN can edit users
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = updateUserSchema.parse(body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: validatedData.id },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if email is being changed and if it's already taken
        if (validatedData.email && validatedData.email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: validatedData.email },
            });

            if (emailExists) {
                return NextResponse.json(
                    { error: "Email already in use" },
                    { status: 400 }
                );
            }
        }

        // Update user
        const updateData: any = {};
        if (validatedData.name !== undefined) updateData.name = validatedData.name;
        if (validatedData.email) updateData.email = validatedData.email;
        if (validatedData.role) updateData.role = validatedData.role;

        const updatedUser = await prisma.user.update({
            where: { id: validatedData.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Update user error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        // Check authentication
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only ADMIN can delete users
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Prevent admin from deleting themselves
        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete user (cascade will handle related data)
        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
