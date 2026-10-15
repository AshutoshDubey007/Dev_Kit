# ==============================================================================
# Multi-Stage Production Dockerfile for DevKit Next.js Platform
# Generates minimal, hardened standalone container under ~120MB
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Install production and build dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY designcodeio-threeui-1.2.0.tgz ./

RUN npm ci --legacy-peer-deps

# ------------------------------------------------------------------------------
# Stage 2: Build Next.js application in standalone mode
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Copy sibling backend directory required for backend modules
COPY ../backend ../backend

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Provide build-time fallback values for static generation
ENV NEXT_PUBLIC_APP_URL=https://devkit.market
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_placeholder
ENV RAZORPAY_KEY_ID=rzp_live_placeholder
ENV RAZORPAY_KEY_SECRET=rzp_secret_placeholder
ENV RAZORPAY_WEBHOOK_SECRET=rzp_webhook_placeholder
ENV MONGODB_URI=mongodb://localhost:27017/devkit_build_mock
ENV NEXTAUTH_SECRET=devkit_production_build_secret_key_0123456789

RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Minimal hardened production runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and public assets
COPY --from=builder /app/public ./public

# Set correct permissions for Next.js prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 0

CMD ["node", "server.js"]
