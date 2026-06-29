FROM node:20-alpine AS base

WORKDIR /app

# O projeto fixa a versão do pnpm em package.json via `packageManager`
# para garantir builds reproduzíveis no Docker e no ambiente local.
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# ── production build ─────────────────────────────────────────────────
FROM base AS builder

RUN pnpm build

# ── production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma

EXPOSE 3333

CMD ["pnpm", "start:prod"]

# ── development (used by docker-compose with volume mounts) ──────────
FROM base AS development

EXPOSE 3333

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm prisma:seed && pnpm start:dev"]
