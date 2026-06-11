# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies from the lockfile (isolated from the host node_modules)
COPY package.json package-lock.json ./
RUN npm ci

# Build the Next.js app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Drop dev dependencies for a smaller runtime
RUN npm prune --omit=dev

# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as the unprivileged node user shipped in the base image
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts

USER node
EXPOSE 3000

# Uses the project's own start script: `next start`
CMD ["npm", "run", "start"]
