FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for Apple Silicon compatibility
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Install dependencies for Apple Silicon compatibility
RUN apk add --no-cache libc6-compat

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

CMD ["node","server.js"]