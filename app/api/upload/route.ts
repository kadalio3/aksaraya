import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
        }

        // Create uploads directory
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "covers");
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);

        // Write file
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        // Return public URL
        const url = `/uploads/covers/${filename}`;

        return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
