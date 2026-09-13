# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on package.json
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Rebuild the source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (uses dummy DATABASE_URL during build phase to satisfy Prisma 7 config validation)
RUN DATABASE_URL="mysql://root:password@localhost:3306/novel" npx prisma generate

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and public folder
COPY --from=builder /app/public ./public

# Set up Next.js standalone folder
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema, config, and generated client for migrations and runtime database access
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/app/generated/prisma ./app/generated/prisma

# Install Prisma CLI globally in the runner stage to ensure all dependencies (like valibot) are resolved
RUN npm install -g prisma@7.5.0

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_PATH=/usr/local/lib/node_modules

# Run migrations and start the application
CMD ["sh", "-c", "prisma migrate deploy && node server.js"]
