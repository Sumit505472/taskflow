# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

# Production stage
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules

COPY backend/ .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "index.js"]