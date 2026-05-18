# syntax=docker/dockerfile:1.7

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/core/package.json packages/core/
COPY packages/types/package.json packages/types/
COPY packages/db/package.json packages/db/
COPY packages/auth/package.json packages/auth/
COPY packages/ai/package.json packages/ai/
COPY packages/storage/package.json packages/storage/
COPY packages/billing/package.json packages/billing/
COPY packages/credits/package.json packages/credits/
COPY packages/ui-primitives/package.json packages/ui-primitives/

RUN pnpm install --frozen-lockfile

# ── build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Build Next.js standalone bundle
RUN pnpm --filter @shotwise/web build

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Next standalone output includes a minimal node_modules
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
