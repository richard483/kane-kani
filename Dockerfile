# Stage 1: Install dependencies and build the project
FROM node:21-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev) for building
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create production image
FROM node:21-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --frozen-lockfile --omit=dev

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Copy other necessary files
COPY src/middleware.ts ./src/middleware.ts
COPY src/app/types/Bill.ts ./src/app/types/Bill.ts

EXPOSE 3000

CMD ["npm", "start"]