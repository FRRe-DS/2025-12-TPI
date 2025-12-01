# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code (excluding node_modules via .dockerignore)
COPY . .

# Build the application
ARG NEXT_PUBLIC_API_URL=http://operator-interface-service:3004
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy necessary files from standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3006

ENV PORT=3006
ENV HOSTNAME="0.0.0.0"

# Verify server.js exists before starting
RUN ls -la server.js || (echo "ERROR: server.js not found in .next/standalone" && exit 1)

CMD ["node", "server.js"]

