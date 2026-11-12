FROM node:24-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

FROM base AS manifests

RUN npm install --global pnpm@11.18.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/crm-web/package.json ./apps/crm-web/package.json
COPY apps/crm-api/package.json ./apps/crm-api/package.json
COPY packages/database/package.json ./packages/database/package.json

FROM manifests AS build

RUN pnpm --filter @crm/crm-api... install --frozen-lockfile

COPY packages/database/tsconfig.json packages/database/tsconfig.build.json packages/database/prisma.config.ts ./packages/database/
COPY packages/database/prisma/ ./packages/database/prisma/
COPY packages/database/src/ ./packages/database/src/

RUN DATABASE_URL=postgresql://build:build@localhost:5432/build \
    pnpm --filter @crm/database run build

COPY apps/crm-api/nest-cli.json apps/crm-api/tsconfig.json apps/crm-api/tsconfig.build.json ./apps/crm-api/
COPY apps/crm-api/src/ ./apps/crm-api/src/
COPY apps/crm-api/types/ ./apps/crm-api/types/

RUN pnpm --filter @crm/crm-api run build \
    && test -f apps/crm-api/dist/src/main.js \
    && test -f apps/crm-api/dist/src/bootstrap/cli/issue_setup_token.js

FROM manifests AS production_deps

RUN pnpm --filter @crm/crm-api... install --prod --frozen-lockfile

FROM manifests AS migrate

RUN pnpm --filter @crm/database install --frozen-lockfile

COPY packages/database/prisma.config.ts ./packages/database/
COPY packages/database/prisma/ ./packages/database/prisma/

WORKDIR /workspace/packages/database
USER node

CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]

FROM base AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4200
ENV NODE_PATH=/workspace/apps/crm-api/dist

COPY --from=production_deps /workspace/node_modules ./node_modules
COPY --from=production_deps /workspace/apps/crm-api/node_modules ./apps/crm-api/node_modules
COPY --from=production_deps /workspace/packages/database/node_modules ./packages/database/node_modules

COPY --from=build /workspace/apps/crm-api/package.json ./apps/crm-api/package.json
COPY --from=build /workspace/apps/crm-api/dist/ ./apps/crm-api/dist/
COPY --from=build /workspace/packages/database/package.json ./packages/database/package.json
COPY --from=build /workspace/packages/database/dist/ ./packages/database/dist/

WORKDIR /workspace/apps/crm-api
USER node
EXPOSE 4200

CMD ["node", "dist/src/main.js"]