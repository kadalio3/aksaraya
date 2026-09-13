import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/validators";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate request body
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email sudah terdaftar" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create user - ALWAYS set role to USER (SECURITY: prevent privilege escalation)
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                role: "USER", // HARDCODED: Never trust client input for role assignment
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            { message: "Registrasi berhasil", user },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: "Data tidak valid", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
