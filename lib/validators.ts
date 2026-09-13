import { z } from "zod";

// User Authentication Schemas
export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // SECURITY: Role is NOT accepted from client - always set to USER server-side
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// Novel Schemas - Accept strings and store as comma-separated
export const createNovelSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    coverUrl: z.string().min(1).optional().or(z.literal("")),
    genres: z.string().min(1, "At least one genre is required"),
    tags: z.string().optional().default(""),
    status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "DROPPED"]).optional().default("ONGOING"),
    updateSchedule: z.string().max(500).optional(),
    totalChapters: z.number().int().positive().optional(),
});

export const updateNovelSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(10).optional(),
    coverUrl: z.string().min(1).optional().or(z.literal("")),
    genres: z.string().optional(),
    tags: z.string().optional(),
    status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "DROPPED"]).optional(),
    updateSchedule: z.string().max(500).optional(),
    totalChapters: z.number().int().positive().optional(),
});

// Chapter Schemas
export const createChapterSchema = z.object({
    novelId: z.string(),
    title: z.string().min(1, "Chapter title is required").max(300),
    content: z.string().min(1, "Chapter content is required"),
    order: z.number().int().positive().optional(),
    isPublished: z.boolean().default(false),
    publishedAt: z.string().datetime().optional().or(z.null()),
});

export const updateChapterSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(300).optional(),
    content: z.string().min(1).optional(),
    order: z.number().int().positive().optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.string().datetime().optional().or(z.null()),
});

// Comment Schema
export const createCommentSchema = z.object({
    chapterId: z.string(),
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

// Favorite Schema
export const toggleFavoriteSchema = z.object({
    novelId: z.string(),
});

// Reading Progress Schema
export const updateProgressSchema = z.object({
    novelId: z.string(),
    chapterId: z.string(),
    progress: z.number().int().min(0).max(100).default(0),
});

// Search & Filter Schemas
export const novelSearchSchema = z.object({
    query: z.string().optional(),
    genre: z.string().optional(),
    tags: z.array(z.string()).optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
});

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateNovelInput = z.infer<typeof createNovelSchema>;
export type UpdateNovelInput = z.infer<typeof updateNovelSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type NovelSearchInput = z.infer<typeof novelSearchSchema>;
