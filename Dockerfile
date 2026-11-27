# syntax=docker/dockerfile:1

# Imagen base con compatibilidad para modulos nativos en Alpine
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencias (solo produccion + build)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Compilacion de Next.js
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Imagen final minima (Next.js standalone)
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 \
  && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:3000/login > /dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
