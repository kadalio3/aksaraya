import { defineConfig, env } from "prisma/config";

// Load dotenv optionally (for local development, fallback in production Docker containers)
const dotenvModule = "dotenv/config";
try {
  // @ts-ignore
  await import(dotenvModule);
} catch (e) {
  // dotenv is not installed in the production container, environment variables are loaded directly from the system
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
