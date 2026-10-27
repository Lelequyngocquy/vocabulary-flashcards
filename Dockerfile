# Multi-stage Dockerfile for Next.js with SQLite
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

# Copy build outputs and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/database.json ./database.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules

# Ensure /data directory exists for volume mount
RUN mkdir -p /data

EXPOSE 80

# Run seed check then start Next.js server
CMD ["sh", "-c", "node scripts/seed.js && node server.js"]
