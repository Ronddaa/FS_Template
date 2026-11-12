FROM node:24-bookworm-slim AS build

WORKDIR /workspace

RUN npm install --global pnpm@11.18.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/crm-web/package.json apps/crm-web/package.json
COPY apps/crm-api/package.json apps/crm-api/package.json
COPY packages/database/package.json packages/database/package.json

RUN pnpm --filter @crm/crm-web install --frozen-lockfile
RUN cd apps/crm-web && node -p "require.resolve('next/dist/bin/next')"

COPY apps/crm-web/next.config.ts apps/crm-web/next-env.d.ts apps/crm-web/tsconfig.json ./apps/crm-web/
COPY apps/crm-web/src/ ./apps/crm-web/src/
COPY apps/crm-web/public/ ./apps/crm-web/public/

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN test -n "$NEXT_PUBLIC_API_URL" && pnpm --filter @crm/crm-web run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build --chown=node:node /workspace/apps/crm-web/.next/standalone/ ./
COPY --from=build --chown=node:node /workspace/apps/crm-web/.next/static/ ./apps/crm-web/.next/static/
COPY --from=build --chown=node:node /workspace/apps/crm-web/public/ ./apps/crm-web/public/

USER node
EXPOSE 3000

CMD ["node", "apps/crm-web/server.js"]