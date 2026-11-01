# ==========================================
# Multi-stage Dockerfile for Resetly API
# ==========================================

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack or npm
RUN npm install -g pnpm@12.16.1

# Install dependencies using lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and configurations
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/
COPY drizzle.config.ts ./

# Build NestJS production artifact
RUN pnpm build

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install pnpm for production dependencies
RUN npm install -g pnpm@12.16.1

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy compiled application code and migrations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database/migrations ./dist/src/database/migrations

# Run as non-root user
USER node

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/v1/health || exit 1

CMD ["node", "dist/src/main"]
