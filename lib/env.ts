import { z } from 'zod';

/**
 * Environment Variables Validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // NextAuth
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

    // Studio Access
    ADMIN_STUDIO_TOKEN: z.string().min(1, 'ADMIN_STUDIO_TOKEN is required'),

    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validate and export environment variables
 * Throws error if validation fails
 */
function validateEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        console.error('❌ Invalid environment variables:');
        console.error(error);
        throw new Error('Environment validation failed');
    }
}

// Export validated environment variables
export const env = validateEnv();

// Type export for TypeScript
export type Env = z.infer<typeof envSchema>;
