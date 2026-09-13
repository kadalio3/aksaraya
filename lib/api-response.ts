import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Standard API error response format
 */
interface ApiErrorResponse {
    error: string;
    code?: string;
    details?: any;
}

/**
 * Centralized API error handler
 * Converts various error types to consistent API responses
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
    // Handle custom API errors
    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                error: error.message,
                code: error.code,
                details: error.details,
            },
            { status: error.statusCode }
        );
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: error.issues,
            },
            { status: 400 }
        );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; meta?: any };

        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            return NextResponse.json(
                {
                    error: 'A record with this value already exists',
                    code: 'DUPLICATE_ENTRY',
                },
                { status: 409 }
            );
        }

        // Record not found
        if (prismaError.code === 'P2025') {
            return NextResponse.json(
                {
                    error: 'Record not found',
                    code: 'NOT_FOUND',
                },
                { status: 404 }
            );
        }
    }

    // Log unexpected errors
    console.error('Unhandled API error:', error);

    // Generic internal server error
    return NextResponse.json(
        {
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
        },
        { status: 500 }
    );
}

/**
 * Success response helper
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse<T> {
    return NextResponse.json(data, { status });
}

/**
 * Common API errors
 */
export const ApiErrors = {
    Unauthorized: () => new ApiError(401, 'Unauthorized', 'UNAUTHORIZED'),
    Forbidden: () => new ApiError(403, 'Forbidden', 'FORBIDDEN'),
    NotFound: (resource?: string) =>
        new ApiError(404, `${resource || 'Resource'} not found`, 'NOT_FOUND'),
    BadRequest: (message?: string) =>
        new ApiError(400, message || 'Bad request', 'BAD_REQUEST'),
    Conflict: (message?: string) =>
        new ApiError(409, message || 'Resource conflict', 'CONFLICT'),
};
