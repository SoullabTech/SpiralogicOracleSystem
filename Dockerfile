FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for Apple Silicon compatibility
RUN apk add --no-cache libc6-compat curl

# Install pnpm
RUN npm install -g pnpm

ENV NODE_ENV=production
ENV DEPLOY_TARGET=docker
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

# Install dependencies for Apple Silicon compatibility and health checks
RUN apk add --no-cache libc6-compat curl

ENV NODE_ENV=production

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set correct permissions
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for Maya Voice system
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node","server.js"]