FROM node:21-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev) for building
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Set environment variable for build
ENV GEMINI_API_KEY=dummy_value

# Build the application
RUN npm run build

# Production stage
FROM node:21-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --frozen-lockfile --omit=dev && npm cache clean --force

# Copy built application and necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Copy runtime files (only if they exist and are needed)
COPY --from=builder /app/src/middleware.ts ./src/middleware.ts
COPY --from=builder /app/src/app/types/Bill.ts ./src/app/types/Bill.ts

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of the app directory
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]