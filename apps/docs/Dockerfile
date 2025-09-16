# syntax=docker/dockerfile:1.6

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/docs/package.json apps/docs/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm --filter @source-taster/docs build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80


