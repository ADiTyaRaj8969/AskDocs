# ── Stage 1: Build React frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production Express server ─────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy server
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/

# Copy built frontend into place (server serves it as static files)
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create required runtime directories
RUN mkdir -p server/uploads server/vector_db

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:5000/health || exit 1

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app/server
CMD ["node", "index.js"]
