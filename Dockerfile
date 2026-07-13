# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM deps AS db-init
ARG MONGODB_COLLECTION_PREFIX=local_
ENV MONGODB_COLLECTION_PREFIX=$MONGODB_COLLECTION_PREFIX
COPY prisma ./prisma
COPY scripts ./scripts
RUN node scripts/sync-prisma-collections.mjs \
  && npx prisma generate --schema=prisma/.schema.resolved.prisma \
  && npx esbuild prisma/seed.ts --bundle --platform=node --format=cjs --outfile=prisma/seed.runtime.cjs --packages=external \
  && npx esbuild prisma/ensure-admin.ts --bundle --platform=node --format=cjs --outfile=prisma/ensure-admin.runtime.cjs --packages=external

FROM deps AS builder
ARG MONGODB_COLLECTION_PREFIX=local_
ENV MONGODB_COLLECTION_PREFIX=$MONGODB_COLLECTION_PREFIX
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY docker/entrypoint.sh ./docker/entrypoint.sh
COPY docker/wait-for-mongo.mjs ./docker/wait-for-mongo.mjs

RUN chmod +x ./docker/entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker/entrypoint.sh"]
